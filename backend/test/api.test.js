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
    await Employee.create({ ...u, name: u.id, dept: 'Engineering', joined: '2024-01-01', aadhaar: '123412341234', phone: '9999999999', status: 'Approved' });
  }
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  hr = await login('t-hr@test.local', 'hrpass123');
  emp = await login('t-emp@test.local', 'emppass123');
  other = await login('t-other@test.local', 'otherpass123');
});

after(async () => {
  await Employee.deleteMany({ email: /@test\.local$/ });
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
