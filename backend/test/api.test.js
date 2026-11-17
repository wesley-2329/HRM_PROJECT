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

test('engagement dashboard: counts come from the database, no fixed scores', async () => {
  const T = mongoose.connection.collection('helpdesktickets');
  await T.deleteMany({ ticketId: /^T-HD-/ });
  const before = (await call('GET', '/api/engagement/dashboard', hr)).data;
  await T.insertOne({ ticketId: 'T-HD-1', category: 'IT Support', subject: 's', description: 'd', raisedBy: { id: 'T-EMP', name: 'T' }, status: 'Open', dueDate: new Date(Date.now() - 36e5) });
  const after = (await call('GET', '/api/engagement/dashboard', hr)).data;
  assert.strictEqual(after.openHelpdeskTickets, before.openHelpdeskTickets + 1);
  assert.strictEqual(after.overdueHelpdeskTickets, before.overdueHelpdeskTickets + 1);
  assert.ok(!('slaPerformanceScore' in after) && !('employeeEngagementScore' in after));
  await T.deleteMany({ ticketId: /^T-HD-/ });
});

test('demo reset does not exist outside a demo deployment', async () => {
  // This test server is not a Preview deployment and its database is not *_demo, like production.
  assert.strictEqual((await call('POST', '/api/demo/reset', emp)).status, 403, 'employees never');
  assert.strictEqual((await call('POST', '/api/demo/reset', hr)).status, 404, 'HR outside demo: not found');
});

test('budget dashboard and analytics: totals come from stored budget lines only', async () => {
  const B = mongoose.connection.collection('hrbudgets');
  await B.deleteMany({ budgetId: /^T-BDG-/ });
  const before = (await call('GET', '/api/budget/dashboard', hr)).data;
  await B.insertOne({ budgetId: 'T-BDG-1', financialYear: 'FY T', department: 'T-Dept', costCenter: 'CC-T', budgetCategory: 'T-Cat', proposedBudget: 1000, approvedBudget: 800, utilizedBudget: 200 });
  const after = (await call('GET', '/api/budget/dashboard', hr)).data;
  assert.strictEqual(after.kpis.totalBudget - before.kpis.totalBudget, 800);
  assert.strictEqual(after.kpis.totalUtilized - before.kpis.totalUtilized, 200);
  assert.deepStrictEqual(after.charts.departmentUtilization.find(d => d.department === 'T-Dept'), { department: 'T-Dept', budget: 800, actual: 200 });
  assert.ok(after.charts.categoryBreakdown.some(c => c.category === 'T-Cat' && c.budget === 800));
  const fc = (await call('GET', '/api/budget/forecast', hr)).data;
  assert.ok(!fc.forecasts.some(f => f.forecastId === 'FC-101'), 'no built-in sample forecasts');
  await B.deleteMany({ budgetId: /^T-BDG-/ });
});

test('compliance dashboard counts stored due dates; listing documents never creates any', async () => {
  const D = mongoose.connection.collection('duedatetrackers');
  await D.deleteMany({ title: /^T-DUE/ });
  const docsBefore = await mongoose.connection.collection('compliancedocuments').countDocuments();
  await call('GET', '/api/compliance/documents', hr);
  assert.strictEqual(await mongoose.connection.collection('compliancedocuments').countDocuments(), docsBefore, 'GET must not write');
  const before = (await call('GET', '/api/compliance/dashboard', hr)).data.kpis;
  await D.insertMany([
    { title: 'T-DUE-1', dueDate: new Date(Date.now() - 864e5), status: 'Pending' },
    { title: 'T-DUE-2', dueDate: new Date(Date.now() + 3 * 864e5), status: 'Pending' },
    { title: 'T-DUE-3', dueDate: new Date(Date.now() - 864e5), status: 'Completed' }
  ]);
  const after = (await call('GET', '/api/compliance/dashboard', hr)).data.kpis;
  assert.strictEqual(after.overdueItems - before.overdueItems, 1, 'past due and not completed');
  assert.strictEqual(after.upcomingDueDates - before.upcomingDueDates, 1, 'within 15 days');
  assert.strictEqual(after.completedActivities - before.completedActivities, 1);
  assert.notStrictEqual(after.compliancePercentage, '96.8%');
  assert.ok(!('complianceRiskScore' in after));
  await D.deleteMany({ title: /^T-DUE/ });
});

test('recruitment and training dashboards: no invented series or rates', async () => {
  const r = (await call('GET', '/api/recruitment/dashboard', hr)).data;
  const candidates = await mongoose.connection.collection('candidates').countDocuments({ deletedAt: null });
  assert.strictEqual(r.recruitmentFunnel[0].count, candidates, 'Applied = stored candidates');
  assert.strictEqual(r.monthlyHiringTrend.length, 6);
  assert.notDeepStrictEqual(r.monthlyHiringTrend.map(m => m.count), [12, 18, 15, 22, 28, 35]);
  assert.ok(!r.departmentHiring.some(d => d.dept === 'Product Design' && d.vacancies === 3));
  const t = (await call('GET', '/api/training/dashboard', hr)).data;
  assert.ok(!('trainingBudgetUtilization' in t));
  assert.notStrictEqual(t.skillGapClosurePercentage, '88.4%');
});

test('compliance documents: a real file is stored privately and served back byte for byte', async () => {
  const post = async (token, fields, bytes, name) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.append(k, v);
    if (bytes) fd.append('file', new Blob([bytes]), name);
    const res = await fetch(base + '/api/compliance/documents', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    return { status: res.status, data: await res.json() };
  };
  const pdf = Buffer.from('%PDF-1.4\nT-DOC test file\n%%EOF');
  const fields = { title: 'T-DOC PF challan', category: 'Challan Receipt' };

  assert.strictEqual((await post(emp, fields, pdf, 'a.pdf')).status, 403, 'employees cannot upload');
  assert.strictEqual((await post(hr, fields)).status, 400, 'a file is required');
  assert.strictEqual((await post(hr, fields, pdf, 'a.html')).status, 400, 'type not on the allow list');
  assert.strictEqual((await post(hr, fields, Buffer.from('<script>alert(1)</script>'), 'a.pdf')).status, 400, 'renamed file');
  assert.strictEqual((await post(hr, { ...fields, category: 'Nope' }, pdf, 'a.pdf')).status, 400, 'unknown category');
  assert.strictEqual((await post(hr, fields, Buffer.alloc(4 * 1024 * 1024 + 1, 0x25), 'big.pdf')).status, 400, 'over 4 MB');

  const made = await post(hr, fields, pdf, 'challan july.pdf');
  assert.strictEqual(made.status, 201);
  assert.strictEqual(made.data.fileName, 'challan july.pdf');
  const url = `${base}/api/compliance/documents/${made.data.docId}/download`;
  assert.strictEqual((await fetch(url)).status, 401, 'no public access');
  assert.strictEqual((await fetch(`${base}/uploads/${made.data.docId}.pdf`)).status, 404, 'not reachable through /uploads');
  const got = await fetch(url, { headers: { Authorization: `Bearer ${hr}` } });
  assert.strictEqual(got.status, 200);
  assert.strictEqual(got.headers.get('content-type'), 'application/pdf');
  assert.strictEqual(got.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(Buffer.from(await got.arrayBuffer()).equals(pdf));

  const C = mongoose.connection.collection('compliancedocuments');
  await C.insertOne({ docId: 'T-DOC-LEGACY', title: 'T-DOC legacy', category: 'Challan Receipt' });
  assert.strictEqual((await call('GET', '/api/compliance/documents/T-DOC-LEGACY/preview', hr)).status, 404, 'no generated stand-in PDF');
  await mongoose.connection.collection('compliance_files.files').deleteMany({ filename: new RegExp('^' + made.data.docId) });
  await C.deleteMany({ title: /^T-DOC/ });
});

test('forms: empty required fields are refused, never filled with sample values', async () => {
  const r = await call('POST', '/api/compliance/inspections', hr, { authority: 'T-AUTH', location: 'x', findings: 'y' });
  assert.strictEqual(r.status, 400);
  assert.match(r.data.message, /Inspector name/);
  assert.strictEqual((await call('POST', '/api/compliance/challans/NOPE/pay', hr, {})).status, 400, 'bank reference required');
  assert.strictEqual((await call('POST', '/api/budget/planning', hr, { department: 'T-Dept' })).status, 400);
  const d = (await call('GET', '/api/exit/dashboard', hr)).data;
  const separated = await mongoose.connection.collection('employeeexits').countDocuments({ status: 'Separated' });
  assert.strictEqual(d.kpis.completedExits, separated, 'no fallback figure');
  assert.ok(!('monthlyAttrition' in d.charts));
});

test('exit: certificate only after every required clearance is approved; HR only', async () => {
  const E = mongoose.connection.collection('employeeexits');
  await E.insertOne({ exitId: 'T-EXT-NDC', employeeId: 'T-OTHER', employeeName: 'T-OTHER', department: 'Engineering', joiningDate: new Date('2024-01-01'), resignationDate: new Date(), proposedLwd: new Date(), status: 'Submitted' });
  try {
    let st = (await call('GET', '/api/exit/no-due/T-EXT-NDC', hr)).data;
    assert.strictEqual(st.started, false);
    assert.strictEqual((await call('POST', '/api/exit/no-due/T-EXT-NDC', hr)).status, 409, 'nothing approved yet');
    assert.strictEqual((await call('POST', '/api/exit/clearance/start/T-EXT-NDC', emp)).status, 403);
    st = (await call('POST', '/api/exit/clearance/start/T-EXT-NDC', hr)).data;
    assert.ok(st.required.length > 0 && st.pending.length === st.required.length);
    assert.strictEqual((await call('GET', '/api/exit/no-due/T-EXT-NDC', emp)).status, 404, 'another employee cannot see it');
    assert.strictEqual((await call('GET', '/api/exit/no-due/T-EXT-NDC', other)).status, 200, 'the exiting employee can');
    const [first, ...rest] = st.clearances;
    assert.strictEqual((await call('PUT', `/api/exit/clearance/${first.clearanceId}`, hr, { clearanceStatus: 'On Hold' })).status, 400, 'hold needs remarks');
    assert.strictEqual((await call('PUT', `/api/exit/clearance/${first.clearanceId}`, hr, { clearanceStatus: 'Rejected', remarks: '   ' })).status, 400, 'blank remarks refused');
    assert.strictEqual((await call('PUT', `/api/exit/clearance/${first.clearanceId}`, hr, { clearanceStatus: 'Done' })).status, 400, 'unknown status refused');
    const held = await call('PUT', `/api/exit/clearance/${first.clearanceId}`, hr, { clearanceStatus: 'On Hold', remarks: 'Laptop not returned' });
    assert.strictEqual(held.status, 200);
    assert.strictEqual(held.data.remarks, 'Laptop not returned');
    assert.ok((await call('GET', '/api/exit/no-due/T-EXT-NDC', hr)).data.pending.includes(first.departmentName), 'on hold still blocks');
    assert.strictEqual((await call('PUT', `/api/exit/clearance/${first.clearanceId}`, hr, { clearanceStatus: 'Rejected', remarks: 'Dues outstanding' })).status, 200);
    await call('PUT', `/api/exit/clearance/${first.clearanceId}`, hr, { clearanceStatus: 'Approved' });
    const blocked = await call('POST', '/api/exit/no-due/T-EXT-NDC', hr);
    assert.strictEqual(blocked.status, 409);
    assert.deepStrictEqual(blocked.data.pending, rest.map(c => c.departmentName));
    for (const c of rest) await call('PUT', `/api/exit/clearance/${c.clearanceId}`, emp, { clearanceStatus: 'Approved' });
    assert.strictEqual((await call('POST', '/api/exit/no-due/T-EXT-NDC', hr)).status, 409, 'employee approvals were refused');
    for (const c of rest) await call('PUT', `/api/exit/clearance/${c.clearanceId}`, hr, { clearanceStatus: 'Approved' });
    assert.strictEqual((await call('POST', '/api/exit/no-due/T-EXT-NDC', other)).status, 403, 'employees cannot issue');
    const issued = await call('POST', '/api/exit/no-due/T-EXT-NDC', hr);
    assert.strictEqual(issued.status, 201);
    assert.strictEqual(issued.data.certificate.employeeId, 'T-OTHER');
    assert.strictEqual((await call('PUT', `/api/exit/clearance/${first.clearanceId}`, hr, { clearanceStatus: 'Rejected', remarks: 'x' })).status, 409, 'locked after issue');
  } finally {
    await E.deleteMany({ exitId: 'T-EXT-NDC' });
    await mongoose.connection.collection('departmentclearances').deleteMany({ exitId: 'T-EXT-NDC' });
    await mongoose.connection.collection('noduecertificates').deleteMany({ exitId: 'T-EXT-NDC' });
  }
});

test('compliance documents: HR deletes the record and its stored file; others cannot', async () => {
  const fd = new FormData();
  fd.append('title', 'T-DOC delete me'); fd.append('category', 'Challan Receipt');
  fd.append('file', new Blob([Buffer.from('%PDF-1.4\n%%EOF')]), 'x.pdf');
  const made = await (await fetch(base + '/api/compliance/documents', { method: 'POST', headers: { Authorization: `Bearer ${hr}` }, body: fd })).json();
  const files = mongoose.connection.collection('compliance_files.files');
  assert.strictEqual(await files.countDocuments({ _id: new mongoose.Types.ObjectId(made.fileId) }), 1);
  assert.strictEqual((await call('DELETE', `/api/compliance/documents/${made.docId}`, emp)).status, 403);
  assert.strictEqual((await call('DELETE', `/api/compliance/documents/${made.docId}`, hr)).status, 200);
  assert.strictEqual(await files.countDocuments({ _id: new mongoose.Types.ObjectId(made.fileId) }), 0, 'file removed');
  assert.strictEqual(await mongoose.connection.collection('compliance_files.chunks').countDocuments({ files_id: new mongoose.Types.ObjectId(made.fileId) }), 0);
  assert.strictEqual((await call('GET', `/api/compliance/documents/${made.docId}`, hr)).status, 404);
  assert.strictEqual((await call('DELETE', `/api/compliance/documents/${made.docId}`, hr)).status, 404, 'second delete');
});
