// Adds the full demo showcase (seed_demo + seed_showcase) to a LIVE database under two separate demo
// logins, without changing or deleting any existing record.
//
//   node scripts/seed_live_showcase.js            add the showcase      (uses backend/.env)
//   node scripts/seed_live_showcase.js --remove   remove exactly what was added
//   --env <file>  use another env file;  SCRATCH_URI=<uri>  where the showcase is built first
//                 (default: a temporary "<db>_showcase_tmp" database on the same cluster, dropped afterwards)
//
// The demo is built in the scratch database, then copied across with people renamed EMP-00xx -> DEMO-EMP-00xx
// and emails moved to @demo.hrorbit.app, so nothing collides with real employees. Master records (departments,
// grades, ...) that already exist by name are not duplicated. Every inserted _id is listed in
// `demo_showcase_manifest`, which --remove uses.
const path = require('path');
const mongoose = require('mongoose');

const argv = process.argv.slice(2);
const envFlag = argv.indexOf('--env');
require('dotenv').config({ path: path.join(__dirname, '..', envFlag > -1 ? argv[envFlag + 1] : '.env') });
const { seedDemoData } = require('./seed_demo');

const DOMAIN = 'demo.hrorbit.app';
const LOGINS = {
  hr: [`hr@${DOMAIN}`, process.env.LIVE_DEMO_HR_PASSWORD || 'DemoHR@2026'],
  employee: [`employee@${DOMAIN}`, process.env.LIVE_DEMO_EMPLOYEE_PASSWORD || 'DemoEmp@2026']
};
const MANIFEST = 'demo_showcase_manifest';
// Shared lookup lists: reuse the live entry with the same name instead of adding a second one.
const MASTERS = ['companymasters', 'branchmasters', 'businessunitmasters', 'costcentermasters', 'gradebandmasters',
  'designationmasters', 'departments', 'statutoryactmasters', 'kramasters'];

const rename = (v) => {
  // record codes DEMO-xxx become SHOW-xxx, so they can't clash with a demo seed that once ran on this database
  if (typeof v === 'string') return v.replace(/\bDEMO-/g, 'SHOW-').replace(/\bEMP-(\d{4})\b/g, 'DEMO-EMP-$1').replace(/@company\.com\b/g, `@${DOMAIN}`);
  if (Array.isArray(v)) return v.map(rename);
  if (v && Object.getPrototypeOf(v) === Object.prototype) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rename(x)]));
  return v; // ObjectId, Date, Binary (GridFS chunks), numbers
};

async function add(target) {
  if (await target.collection(MANIFEST).findOne()) throw new Error('A showcase is already installed. Run with --remove first.');
  if (await target.collection('employees').findOne({ email: { $in: [LOGINS.hr[0], LOGINS.employee[0]] } })) throw new Error('Demo login emails already exist in this database.');

  const scratchUri = process.env.SCRATCH_URI || (() => { const u = new URL(process.env.MONGODB_URI); u.pathname = `${u.pathname.slice(1)}_showcase_tmp`; return u.toString(); })();
  await mongoose.connect(scratchUri);
  const scratch = mongoose.connection.db;
  if (scratch.databaseName === target.databaseName) throw new Error('Scratch and target are the same database.');
  await scratch.dropDatabase();
  // seed_demo puts its passwords on hr@company.com / employee@company.com; rename() moves them to the demo domain
  await seedDemoData({ hrPassword: LOGINS.hr[1], employeePassword: LOGINS.employee[1] });

  let added = 0, reused = 0;
  const skipped = [];
  for (const { name } of await scratch.listCollections().toArray()) {
    if (name.startsWith('system.') || name === 'demo_meta') continue;
    let docs = (await scratch.collection(name).find().toArray()).map(rename);
    if (MASTERS.includes(name)) {
      const taken = new Set((await target.collection(name).find({}, { projection: { name: 1 } }).toArray()).map(d => d.name));
      reused += docs.filter(d => taken.has(d.name)).length;
      docs = docs.filter(d => !taken.has(d.name));
    }
    if (!docs.length) continue;
    // record first, so --remove can clean up even if the insert stops part way
    await target.collection(MANIFEST).insertOne({ collection: name, ids: docs.map(d => d._id), at: new Date() });
    try {
      added += (await target.collection(name).insertMany(docs, { ordered: false })).insertedCount;
    } catch (e) {
      // a record whose unique key (e.g. a ticket number) is already taken by a live record is skipped, not overwritten
      if (!e.writeErrors || e.writeErrors.some(w => w.code !== 11000)) throw e;
      added += e.result?.insertedCount ?? docs.length - e.writeErrors.length;
      skipped.push(`${name}: ${e.writeErrors.length}`);
    }
  }
  if (!process.env.SCRATCH_URI) await scratch.dropDatabase();
  await mongoose.disconnect();
  return { added, reused, skipped };
}

async function remove(target) {
  let removed = 0;
  for (const { collection, ids } of await target.collection(MANIFEST).find().toArray()) {
    removed += (await target.collection(collection).deleteMany({ _id: { $in: ids } })).deletedCount;
  }
  await target.collection(MANIFEST).drop().catch(() => {});
  return { removed };
}

if (require.main === module) {
  (async () => {
    const conn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
    const target = conn.db;
    console.log(`Target database: ${target.databaseName}`);
    const r = argv.includes('--remove') ? await remove(target) : await add(target);
    console.log('Done:', r);
    if (!argv.includes('--remove')) console.log(`Demo logins: ${LOGINS.hr[0]} (HR), ${LOGINS.employee[0]} (employee)`);
    await conn.close();
  })().catch(async (e) => { console.error('Failed:', e.message); await mongoose.disconnect(); process.exit(1); });
}

module.exports = { rename };
