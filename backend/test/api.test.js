// Run: MONGODB_URI=mongodb://127.0.0.1:27017/hrorbit_test npm test
// Refuses to run against anything but a local database: these tests create and delete records.
const { test, before, after } = require('node:test');
const assert = require('node:assert');

const uri = process.env.MONGODB_URI || '';
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)[:/]/.test(uri)) {
  console.error('Refusing to run: set MONGODB_URI to a LOCAL test database.');
  process.exit(1);
}
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const app = require('../server');
const Employee = require('../models/Employee');
const SalaryRevisionRequest = require('../models/SalaryRevisionRequest');
const TransferRequest = require('../models/TransferRequest');
const Leave = require('../models/Leave');

let server, base, hr, emp, other;
const users = [
  { id: 'T-HR', email: 't-hr@test.local', role: 'hr', password: 'hrpass123' },
  { id: 'T-EMP', email: 't-emp@test.local', role: 'employee', password: 'emppass123' },
  { id: 'T-OTHER', email: 't-other@test.local', role: 'employee', password: 'otherpass123' }
];

const call = async (method, path, token, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
};
const login = async (email, password) => (await call('POST', '/api/auth/login', null, { email, password })).data.token;

before(async () => {
  await require('../config/db')();
  await Employee.deleteMany({ email: /@test\.local$/ });
  for (const u of users) {
    await Employee.create({ ...u, name: u.id, dept: 'Engineering', joined: '2024-01-01', aadhaar: '123412341234', phone: '9999999999', status: 'Approved',
      functionalManagerId: u.id === 'T-OTHER' ? 'T-EMP' : '' });
  }
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  hr = await login('t-hr@test.local', 'hrpass123');
  emp = await login('t-emp@test.local', 'emppass123');
  other = await login('t-other@test.local', 'otherpass123');
});

after(async () => {
  await Employee.deleteMany({ email: /@test\.local$/ });
  await mongoose.connection.collection('promotionrequests').deleteMany({ employeeId: /^T-/ });
  await mongoose.connection.collection('piprecords').deleteMany({ employeeId: /^T-/ });
  await mongoose.connection.collection('trainingprograms').deleteMany({ programId: /^T-PRG/ });
  await mongoose.connection.collection('meetings').deleteMany({ title: /^T-MEET/ });
  await mongoose.connection.collection('exitinterviews').deleteMany({ exitId: /^T-EXT/ });
  await SalaryRevisionRequest.deleteMany({ employeeId: /^T-/ });
  await TransferRequest.deleteMany({ employeeId: /^T-/ });
  await Leave.deleteMany({ empId: /^T-/ });
  server.close();
  await mongoose.disconnect();
});

test('login works for all three test users', () => {
  assert.ok(hr && emp && other);
});

test('employees cannot reach HR-only approval and config routes', async () => {
  const fakeId = '000000000000000000000000';
  const hrOnly = [
    ['PUT', `/api/salary-revisions/${fakeId}/action`],
    ['POST', '/api/salary-revisions'],
    ['GET', '/api/salary-revisions/reports'],
    ['PUT', `/api/performance/promotions/${fakeId}/approve`],
    ['PUT', `/api/performance/increments/${fakeId}/approve`],
    ['POST', '/api/performance/cycles'],
    ['PUT', `/api/performance/annual-reviews/${fakeId}/calibrate`],
    ['GET', '/api/promotions/reports'],
    ['GET', '/api/probation/reports'],
    ['POST', '/api/probation/assign'],
    ['GET', '/api/transfers/history'],
    ['GET', '/api/employees'],
    ['PUT', `/api/leaves/${fakeId}`]
  ];
  for (const [method, path] of hrOnly) {
    const r = await call(method, path, emp, method === 'GET' ? undefined : {});
    assert.strictEqual(r.status, 403, `${method} ${path} returned ${r.status}`);
  }
});

test('employee cannot pick an HR role in recruitment through ?role=', async () => {
  const r = await call('PUT', '/api/recruitment/positions/000000000000000000000000/approve?role=hr_admin', emp, {});
  assert.notStrictEqual(r.status, 200);
  assert.notStrictEqual(r.status, 404); // 404 would mean the role check let us through to the lookup
});

test('salary revision: HR approves once, employee only sees own, decision is validated', async () => {
  const created = await call('POST', '/api/salary-revisions', hr, {
    employeeId: 'T-EMP', revisionType: 'Annual Increment', effectiveDate: '2026-04-01', reason: 'Annual cycle', currentCtc: 600000, revisedCtc: 660000
  });
  assert.strictEqual(created.status, 201, JSON.stringify(created.data));
  const id = created.data._id;

  assert.strictEqual((await call('PUT', `/api/salary-revisions/${id}/action`, hr, {})).status, 400);
  assert.strictEqual((await call('PUT', `/api/salary-revisions/${id}/action`, hr, { decision: 'Approved' })).status, 200);
  assert.strictEqual((await call('PUT', `/api/salary-revisions/${id}/action`, hr, { decision: 'Approved' })).status, 400);

  const own = await call('GET', '/api/salary-revisions', emp);
  assert.ok(own.data.data.every(r => r.employeeId === 'T-EMP'));
  const others = await call('GET', '/api/salary-revisions', other);
  assert.strictEqual(others.data.data.length, 0);

  assert.strictEqual((await call('PUT', `/api/salary-revisions/${id}/acknowledge`, other)).status, 403);
  assert.strictEqual((await call('PUT', `/api/salary-revisions/${id}/acknowledge`, emp)).status, 200);
});

test('transfer: employee may raise only their own; cannot approve it', async () => {
  const eff = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  assert.strictEqual((await call('POST', '/api/transfers', emp, { employeeId: 'T-OTHER', transferType: 'Lateral Transfer', transferReason: 'Professional Growth', effectiveDate: eff })).status, 403);
  const own = await call('POST', '/api/transfers', emp, { employeeId: 'T-EMP', transferType: 'Lateral Transfer', transferReason: 'Professional Growth', effectiveDate: eff });
  assert.strictEqual(own.status, 201, JSON.stringify(own.data));
  assert.strictEqual((await call('PUT', `/api/transfers/${own.data._id}/action`, emp, { decision: 'Approve' })).status, 403);
  assert.strictEqual((await call('PUT', `/api/transfers/${own.data._id}/action`, hr, {})).status, 400);
  assert.strictEqual((await call('PUT', `/api/transfers/${own.data._id}/action`, hr, { decision: 'Approve' })).status, 200);
});

test('profile update never returns the password hash', async () => {
  const r = await call('PUT', '/api/employees/T-EMP', emp, { blood: 'B+' });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.data.password, undefined);
});

test('register stores email in lowercase so the user can log in', async () => {
  const r = await call('POST', '/api/auth/register', null, {
    name: 'Case Test', email: 'Case.Test@TEST.local', password: 'casepass1', dept: 'Engineering', aadhaar: '111122223333', phone: '9000000000'
  });
  assert.strictEqual(r.status, 201, JSON.stringify(r.data));
  assert.ok(await login('case.test@test.local', 'casepass1'));
  assert.strictEqual((await call('POST', '/api/auth/register', null, { name: 'x', email: 'case.test@test.local', password: 'casepass1', dept: 'x', aadhaar: '1', phone: '1' })).status, 400);
});

test('stored bcrypt hash does not work as a password', async () => {
  const u = await Employee.findOne({ id: 'T-EMP' });
  const r = await call('POST', '/api/auth/login', null, { email: 't-emp@test.local', password: u.password });
  assert.strictEqual(r.status, 401);
});

test('leave: employee applies, HR approves, employee is notified', async () => {
  const applied = await call('POST', '/api/leaves', emp, { type: 'Casual', start: '2026-12-01', end: '2026-12-02', reason: 'Family' });
  assert.strictEqual(applied.status, 201, JSON.stringify(applied.data));
  assert.strictEqual((await call('PUT', `/api/leaves/${applied.data._id}`, hr, { status: 'Approved' })).status, 200);
  const notes = await call('GET', '/api/notifications', emp);
  assert.ok(JSON.stringify(notes.data).includes('Approved') || JSON.stringify(notes.data).includes('approved'));
});

test('uploads: an .html file is rejected', async () => {
  const form = new FormData();
  form.append('docName', 'Evil');
  form.append('file', new Blob(['<script>alert(1)</script>'], { type: 'text/html' }), 'evil.html');
  const res = await fetch(base + '/api/employees/upload-doc', { method: 'POST', headers: { Authorization: `Bearer ${emp}` }, body: form });
  assert.strictEqual(res.status, 400);
});

test('leave rules: dates, overlap, balance, cancel, revoke', async () => {
  const y = new Date().getUTCFullYear() + 1; // next year: always in the future, own empty balance
  const d = (m, day) => `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  assert.strictEqual((await call('POST', '/api/leaves', other, { type: 'Casual', start: d(3, 5), end: d(3, 4), reason: 'x' })).status, 400, 'end before start');
  assert.strictEqual((await call('POST', '/api/leaves', other, { type: 'Casual', start: d(3, 1), end: d(3, 13), reason: 'x' })).status, 400, '13 days > 12 casual');

  const a = await call('POST', '/api/leaves', other, { type: 'Casual', start: d(3, 2), end: d(3, 4), reason: 'Trip' });
  assert.strictEqual(a.status, 201);
  assert.strictEqual((await call('POST', '/api/leaves', other, { type: 'Sick', start: d(3, 4), end: d(3, 6), reason: 'x' })).status, 400, 'overlap');

  // balance is per year; check the request year by asking the server directly through the helper route
  const bal = await call('GET', '/api/leaves/balance', other);
  assert.strictEqual(bal.status, 200);
  assert.strictEqual(bal.data.balance.Casual.quota, 12);

  // cancel pending
  assert.strictEqual((await call('DELETE', `/api/leaves/${a.data._id}`, emp)).status, 403, 'not owner');
  assert.strictEqual((await call('DELETE', `/api/leaves/${a.data._id}`, other)).status, 200);

  // approve then revoke a future leave
  const b = await call('POST', '/api/leaves', other, { type: 'Earned', start: d(5, 10), end: d(5, 12), reason: 'Wedding' });
  assert.strictEqual((await call('PUT', `/api/leaves/${b.data._id}`, hr, { status: 'Approved' })).status, 200);
  assert.strictEqual((await call('PUT', `/api/leaves/${b.data._id}`, hr, { status: 'Rejected' })).status, 400, 'no re-decision');
  assert.strictEqual((await call('PUT', `/api/leaves/${b.data._id}/revoke`, emp)).status, 403);
  const rv = await call('PUT', `/api/leaves/${b.data._id}/revoke`, hr);
  assert.strictEqual(rv.status, 200);
  assert.strictEqual(rv.data.status, 'Revoked');
  const notes = await call('GET', '/api/notifications', other);
  assert.ok(JSON.stringify(notes.data).includes('revoked'));
});

test('performance: only HR or the reporting manager can recommend; employee needs an employeeId', async () => {
  const body = { employeeId: 'T-OTHER', proposedDesignation: 'Senior Engineer', proposedGrade: 'G5', effectiveDate: '2027-01-01', justification: 'Delivered', currentSalary: 100, proposedSalary: 120 };
  assert.strictEqual((await call('POST', '/api/performance/promotions', emp, {})).status, 400, 'no employee');
  assert.strictEqual((await call('POST', '/api/performance/promotions', other, { ...body, employeeId: 'T-EMP' })).status, 403, 'not their manager');
  const byMgr = await call('POST', '/api/performance/promotions', emp, body);
  assert.ok([200, 201].includes(byMgr.status), 'manager may recommend: ' + JSON.stringify(byMgr.data).slice(0, 200));
  assert.strictEqual((await call('POST', '/api/performance/pip', other, { employeeId: 'T-HR' })).status, 403);
});

test('training: enrolment respects capacity', async () => {
  const P = mongoose.connection.collection('trainingprograms');
  await P.insertOne({ programId: 'T-PRG-1', title: 'T-PRG Capacity', capacity: 1, enrolledEmployees: [], status: 'Scheduled', scheduleDate: new Date(Date.now() + 864e6) });
  assert.strictEqual((await call('POST', '/api/training/programs/T-PRG-1/enroll', emp)).status, 200);
  const full = await call('POST', '/api/training/programs/T-PRG-1/enroll', other);
  assert.strictEqual(full.status, 400, JSON.stringify(full.data));
  assert.match(full.data.message, /full/);
  assert.strictEqual((await call('POST', '/api/training/programs/a.*/enroll', other)).status, 404, 'search text is not a regex');
});

test('exit interview: employee records own; required fields validated', async () => {
  assert.strictEqual((await call('POST', '/api/exit/interview', emp, {})).status, 400);
  const r = await call('POST', '/api/exit/interview', emp, { exitId: 'T-EXT-1', employeeId: 'T-OTHER', overallSatisfactionScore: 3, primaryReason: 'Relocation' });
  assert.strictEqual(r.status, 201, JSON.stringify(r.data));
  assert.strictEqual(r.data.employeeId, 'T-EMP', 'cannot file for someone else');
});
