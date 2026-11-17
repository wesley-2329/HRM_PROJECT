// Demo seeding against a throwaway LOCAL *_demo database. Run with the other tests (npm test).
const { test, before, after } = require('node:test');
const assert = require('node:assert');

const base = process.env.MONGODB_URI || '';
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)[:/]/.test(base)) {
  console.error('Refusing to run: set MONGODB_URI to a LOCAL test database.');
  process.exit(1);
}
const uri = base.replace(/\/[^/?]*(\?|$)/, '/hrorbit_seedcheck_demo$1');
process.env.DEMO_HR_PASSWORD = 'demo-hr-test-pw';
process.env.DEMO_EMPLOYEE_PASSWORD = 'demo-emp-test-pw';
delete process.env.VERCEL_ENV;

const mongoose = require('mongoose');
const { ensureDemoSeeded, demoLoginsReady } = require('../scripts/seed_demo');
const HrBudget = require('../models/HrBudget');

before(async () => { await mongoose.connect(uri); });
after(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

test('demo seed: a failure part-way is retried from scratch and ends with working logins', async () => {
  const realCreate = HrBudget.create;
  let calls = 0;
  HrBudget.create = function (...a) { if (++calls === 1) throw new Error('simulated dropped connection'); return realCreate.apply(this, a); };
  try {
    assert.strictEqual(await ensureDemoSeeded({ force: true }), 'seeded');
  } finally { HrBudget.create = realCreate; }
  assert.strictEqual(calls, 2, 'second attempt ran');
  assert.ok(await demoLoginsReady());
  const db = mongoose.connection.db;
  assert.strictEqual(await db.collection('employees').countDocuments(), 12, 'no duplicates from the failed attempt');
  assert.ok(await db.collection('hrbudgets').countDocuments({ budgetId: /^DEMO-/ }) > 0);
  assert.ok(await db.collection('duedatetrackers').countDocuments({ trackerId: /^DEMO-/ }) > 0);
  assert.strictEqual(await db.collection('employeeexits').countDocuments({ exitId: /^DEMO-/ }), 2);
  assert.strictEqual(await db.collection('hrbudgets').countDocuments({ budgetId: { $not: /^DEMO-/ } }), 0, 'every module record is labelled DEMO-');
  assert.strictEqual(await db.collection('demo_meta').countDocuments({ _id: 'seed-lock' }), 0, 'lock released');
});

test('demo seed: never runs for a production deployment', async () => {
  process.env.VERCEL_ENV = 'production';
  try { assert.strictEqual(await ensureDemoSeeded({ force: true }), 'skipped: production deployment'); }
  finally { delete process.env.VERCEL_ENV; }
});

test('demo seed: a wiped demo database is rebuilt when asked without force', async () => {
  await mongoose.connection.db.collection('employees').deleteMany({});
  assert.strictEqual(await ensureDemoSeeded(), 'seeded');
  assert.ok(await demoLoginsReady());
});
