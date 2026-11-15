// Rebuilds the DEMO database with consistent sample data.
//
//   MONGODB_URI=<uri ending in /hrorbit_demo?...> DEMO_HR_PASSWORD=... DEMO_EMPLOYEE_PASSWORD=... node scripts/seed_demo.js
//   (or put those three lines in backend/.env.demo and run: node scripts/seed_demo.js --env .env.demo)
//
// Safety: refuses to run unless the database name ends in "_demo" or the host is local.
// It DROPS that database first, so every run gives the same clean demo.
const path = require('path');
const crypto = require('crypto');
const envFlag = process.argv.indexOf('--env');
require('dotenv').config({ path: path.join(__dirname, '..', envFlag > -1 ? process.argv[envFlag + 1] : '.env.demo') });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || '';
const dbName = (() => { try { return decodeURIComponent(new URL(uri).pathname.replace(/^\//, '')); } catch { return ''; } })();
const isLocal = /^mongodb:\/\/(127\.0\.0\.1|localhost)[:/]/.test(uri);
if (!dbName.endsWith('_demo') && !isLocal) {
  console.error(`Refusing to seed: database "${dbName || '(none)'}" is not a demo database (name must end in "_demo").`);
  process.exit(1);
}
const { DEMO_HR_PASSWORD, DEMO_EMPLOYEE_PASSWORD } = process.env;
if (!DEMO_HR_PASSWORD || !DEMO_EMPLOYEE_PASSWORD) {
  console.error('Set DEMO_HR_PASSWORD and DEMO_EMPLOYEE_PASSWORD (the two public demo logins).');
  process.exit(1);
}

const Employee = require('../models/Employee');
const Department = require('../models/Department');
const CompanyMaster = require('../models/CompanyMaster');
const BranchMaster = require('../models/BranchMaster');
const BusinessUnitMaster = require('../models/BusinessUnitMaster');
const CostCenterMaster = require('../models/CostCenterMaster');
const DesignationMaster = require('../models/DesignationMaster');
const GradeBandMaster = require('../models/GradeBandMaster');
const Vacancy = require('../models/Vacancy');
const Candidate = require('../models/Candidate');
const Leave = require('../models/Leave');
const Timesheet = require('../models/Timesheet');
const Notification = require('../models/Notification');
const Ticket = require('../models/Ticket');
const Task = require('../models/Task');
const Training = require('../models/Training');
const DiscussionMessage = require('../models/DiscussionMessage');

// Deterministic "random" so every seed produces the same demo.
let state = 20261115;
const rand = () => ((state = (state * 1103515245 + 12345) % 2147483648) / 2147483648);
const DAY = 864e5;
const ymd = (d) => d.toISOString().slice(0, 10);
const daysFromToday = (n) => ymd(new Date(Date.now() + n * DAY));
const isWeekday = (d) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6;

// [id, name, role, dept, designation, grade, managerId, joined, gender]
const PEOPLE = [
  ['EMP-0001', 'Venkat Raman', 'hr', 'Human Resources', 'HR Director', 'L4', '', '2018-04-02', 'Male'],
  ['EMP-0002', 'Aditya Kumar', 'employee', 'Engineering', 'Senior Software Engineer', 'L2', 'EMP-0006', '2021-07-12', 'Male'],
  ['EMP-0003', 'Priya Nair', 'employee', 'Engineering', 'Software Engineer', 'L1', 'EMP-0002', '2023-03-01', 'Female'],
  ['EMP-0004', 'Rahul Sharma', 'employee', 'Engineering', 'Software Engineer', 'L1', 'EMP-0002', '2024-01-15', 'Male'],
  ['EMP-0005', 'Sneha Patel', 'employee', 'Human Resources', 'HR Specialist', 'L1', 'EMP-0001', '2020-08-20', 'Female'],
  ['EMP-0006', 'Kavitha Iyer', 'employee', 'Engineering', 'Engineering Manager', 'L4', '', '2019-02-11', 'Female'],
  ['EMP-0007', 'Mohammed Faisal', 'employee', 'Engineering', 'QA Engineer', 'L1', 'EMP-0006', '2023-09-04', 'Male'],
  ['EMP-0008', 'Ananya Desai', 'employee', 'Finance', 'Finance Manager', 'L3', '', '2019-11-18', 'Female'],
  ['EMP-0009', 'Karthik Reddy', 'employee', 'Finance', 'Accounts Executive', 'L1', 'EMP-0008', '2022-06-06', 'Male'],
  ['EMP-0010', 'Meera Krishnan', 'employee', 'Sales & Marketing', 'Marketing Lead', 'L3', '', '2020-01-27', 'Female'],
  ['EMP-0011', 'Rohit Verma', 'employee', 'Sales & Marketing', 'Sales Executive', 'L1', 'EMP-0010', '2024-05-20', 'Male'],
  ['EMP-0012', 'Divya Menon', 'employee', 'Human Resources', 'Talent Acquisition Executive', 'L1', 'EMP-0001', '2025-02-03', 'Female']
];
const LOGINS = { 'EMP-0001': ['hr@company.com', DEMO_HR_PASSWORD], 'EMP-0002': ['employee@company.com', DEMO_EMPLOYEE_PASSWORD] };
const nameOf = Object.fromEntries(PEOPLE.map(p => [p[0], p[1]]));

async function seed() {
  await mongoose.connect(uri);
  console.log(`Seeding demo database "${mongoose.connection.name}"...`);
  await mongoose.connection.db.dropDatabase();

  // Masters
  await CompanyMaster.create({ name: 'HR O Technologies (Demo)', code: 'HO-001', businessType: 'Information Technology', status: 'Active' });
  await BranchMaster.create([
    { name: 'HQ Bangalore', code: 'BLR-01', location: 'Bangalore, KA', branchHead: 'Venkat Raman', status: 'Active' },
    { name: 'Tech Park Pune', code: 'PUN-02', location: 'Pune, MH', branchHead: 'Kavitha Iyer', status: 'Active' }
  ]);
  await BusinessUnitMaster.create([
    { name: 'Cloud Solutions', code: 'BU-CS', status: 'Active' },
    { name: 'Corporate Functions', code: 'BU-CF', status: 'Active' }
  ]);
  await CostCenterMaster.create([
    { name: 'Engineering CC', code: 'CC-ENG', status: 'Active' },
    { name: 'HR Operations CC', code: 'CC-HR', status: 'Active' },
    { name: 'Finance CC', code: 'CC-FIN', status: 'Active' },
    { name: 'Sales & Marketing CC', code: 'CC-SM', status: 'Active' }
  ]);
  await GradeBandMaster.create(['L1', 'L2', 'L3', 'L4'].map((name, i) => ({ name, description: ['Associate', 'Senior', 'Lead', 'Manager / Director'][i], status: 'Active' })));
  await DesignationMaster.create([...new Set(PEOPLE.map(p => p[4]))].map((name, i) => {
    const p = PEOPLE.find(x => x[4] === name);
    return { name, code: `DES-${i + 1}`, deptMapping: p[3], gradeMapping: p[5], positionLimit: 10, status: 'Active' };
  }));
  const deptHeads = { 'Human Resources': 'EMP-0001', Engineering: 'EMP-0006', Finance: 'EMP-0008', 'Sales & Marketing': 'EMP-0010' };
  await Department.create(Object.entries(deptHeads).map(([name, managerId], i) => ({
    name, code: `DEPT-${i + 1}`, description: `${name} department`, parentDept: '', managerId,
    businessUnit: name === 'Engineering' ? 'Cloud Solutions' : 'Corporate Functions',
    location: name === 'Engineering' ? 'Tech Park Pune' : 'HQ Bangalore',
    costCenter: { Engineering: 'Engineering CC', 'Human Resources': 'HR Operations CC', Finance: 'Finance CC', 'Sales & Marketing': 'Sales & Marketing CC' }[name],
    status: 'Active'
  })));

  // Employees: demo logins use the documented passwords; everyone else gets a random one nobody knows.
  for (const [id, name, role, dept, designation, grade, managerId, joined, gender] of PEOPLE) {
    const [email, password] = LOGINS[id] || [`${name.split(' ')[0].toLowerCase()}.${id.slice(-4)}@company.com`, crypto.randomBytes(12).toString('base64url')];
    await Employee.create({
      id, name, role, dept, designation, grade, joined, gender, email, password,
      functionalManagerId: managerId, teamLeadId: managerId, isTeamLead: PEOPLE.some(p => p[6] === id),
      status: 'Approved', employeeCategory: 'Permanent',
      branch: dept === 'Engineering' ? 'Tech Park Pune' : 'HQ Bangalore',
      businessUnit: dept === 'Engineering' ? 'Cloud Solutions' : 'Corporate Functions',
      aadhaar: `0000-0000-${id.slice(-4)}`, phone: `+91 90000 0${id.slice(-4)}`
    });
  }

  // Leaves (dates relative to today) — approved days are skipped in attendance below.
  const leaves = [
    ['EMP-0003', 'Casual', -11, -10, 'Family function', 'Approved'],
    ['EMP-0004', 'Sick', -6, -6, 'Fever', 'Approved'],
    ['EMP-0011', 'Sick', -15, -15, 'Medical appointment', 'Rejected'],
    ['EMP-0009', 'Earned', 20, 24, 'Annual vacation', 'Approved'],
    ['EMP-0002', 'Earned', 12, 14, 'Travel to hometown', 'Pending'],
    ['EMP-0007', 'Casual', 5, 5, 'Personal work', 'Pending'],
    ['EMP-0012', 'Sick', 2, 3, 'Planned minor surgery', 'Pending']
  ];
  const onLeave = new Set();
  for (const [empId, type, from, to, reason, status] of leaves) {
    await Leave.create({ empId, empName: nameOf[empId], type, start: daysFromToday(from), end: daysFromToday(to), reason, status });
    if (status === 'Approved') for (let d = from; d <= to; d++) onLeave.add(`${empId}|${daysFromToday(d)}`);
    if (status === 'Pending') {
      await Notification.create({ type: 'leave', title: 'New Leave Request', desc: `${nameOf[empId]} applied for ${type} leave from ${daysFromToday(from)} to ${daysFromToday(to)}.`, empId: 'hr' });
    } else {
      await Notification.create({ type: 'leave', title: `Leave request ${status}`, desc: `Your leave request for ${type} has been ${status.toLowerCase()}.`, empId });
    }
  }

  // Attendance: last 30 days, weekdays only, 09:30 IST shift (15 min grace). Today: most people are clocked in.
  const sheets = [];
  for (let back = 30; back >= 0; back--) {
    const day = new Date(Date.now() - back * DAY);
    if (!isWeekday(day)) continue;
    const date = ymd(day);
    for (const [empId] of PEOPLE) {
      if (onLeave.has(`${empId}|${date}`) || rand() < 0.04) continue; // on leave, or ~4% unplanned absence
      if (back === 0 && rand() < 0.25) continue;                        // not in yet today
      const late = rand() < 0.1;
      const inMinIst = late ? 9 * 60 + 50 + Math.floor(rand() * 35) : 9 * 60 + Math.floor(rand() * 40);
      const clockIn = new Date(`${date}T00:00:00Z`); clockIn.setUTCMinutes(inMinIst - 330);
      if (back === 0) { sheets.push({ empId, date, clockIn, status: 'Active Shift' }); continue; }
      const hours = +(8 + rand() * 1.2 - (rand() < 0.05 ? 1.5 : 0)).toFixed(2);
      sheets.push({ empId, date, clockIn, clockOut: new Date(clockIn.getTime() + hours * 36e5), hours,
        status: late ? 'Late Entry' : hours >= 8 ? 'Punctual' : 'Early Out' });
    }
  }
  await Timesheet.insertMany(sheets);

  // Recruitment
  await Vacancy.create([
    { positionId: 'POS-1001', jobTitle: 'Senior Backend Developer (Node.js)', dept: 'Engineering', managerId: 'EMP-0006', status: 'Open', budget: 1800000,
      description: 'Build and run the Node.js services behind our cloud products.', priorityLevel: 'High', requiredDate: new Date(Date.now() + 30 * DAY),
      vacancyReason: 'Team expansion', approvedHeadcount: 2, vacancyCount: 2 },
    { positionId: 'POS-1002', jobTitle: 'Accounts Executive', dept: 'Finance', managerId: 'EMP-0008', status: 'Open', budget: 700000,
      description: 'Accounts payable, reconciliations and month-end close.', priorityLevel: 'Medium', requiredDate: new Date(Date.now() + 45 * DAY),
      vacancyReason: 'Replacement', approvedHeadcount: 1, vacancyCount: 1 }
  ]);
  const cands = [
    ['Arjun Mehta', 'Senior Backend Developer (Node.js)', 'LinkedIn', '6 Years', 'applied', 'Node.js, Express, MongoDB, AWS'],
    ['Divya Joshi', 'Senior Backend Developer (Node.js)', 'Naukri', '5 Years', 'screening', 'Node.js, PostgreSQL, Docker'],
    ['Vikram Singh', 'Senior Backend Developer (Node.js)', 'Referral', '7 Years', 'interview', 'Node.js, Kafka, Kubernetes'],
    ['Neha Reddy', 'Accounts Executive', 'Indeed', '3 Years', 'screening', 'Tally, GST, Reconciliation'],
    ['Siddharth Rao', 'Senior Backend Developer (Node.js)', 'LinkedIn', '8 Years', 'offered', 'Node.js, System Design, AWS'],
    ['Pooja Sharma', 'Accounts Executive', 'Campus', '2 Years', 'applied', 'Excel, Accounts Payable']
  ];
  await Candidate.create(cands.map(([name, role, source, experience, stage, skills], i) =>
    ({ name, role, source, experience, stage, skills, email: `candidate${i + 1}@example.com`, phone: `+91 90000 1000${i}` })));

  // Helpdesk, tasks, training, discussion
  await Ticket.create([
    { id: 'TCK-201', empId: 'EMP-0002', title: 'VPN disconnects every hour', category: 'IT Support', priority: 'High', status: 'Open', raisedOn: daysFromToday(-2), response: '' },
    { id: 'TCK-202', empId: 'EMP-0003', title: 'Update bank account for reimbursements', category: 'HR Query', priority: 'Medium', status: 'Open', raisedOn: daysFromToday(-4), response: '' },
    { id: 'TCK-203', empId: 'EMP-0009', title: 'Laptop battery replacement', category: 'IT Support', priority: 'Low', status: 'Closed', raisedOn: daysFromToday(-12), response: 'Battery replaced.' }
  ]);
  await Task.create([
    { title: 'Code review: payment retry service', project: 'Cloud Platform', priority: 'High', due: daysFromToday(2), progress: 40, status: 'in-progress', empId: 'EMP-0002' },
    { title: 'Complete security awareness module', project: 'Compliance', priority: 'Medium', due: daysFromToday(6), progress: 0, status: 'todo', empId: 'EMP-0002' },
    { title: 'Sprint retrospective notes', project: 'Cloud Platform', priority: 'Low', due: daysFromToday(-3), progress: 100, status: 'done', empId: 'EMP-0002' },
    { title: 'Fix flaky login test', project: 'Cloud Platform', priority: 'Medium', due: daysFromToday(4), progress: 20, status: 'in-progress', empId: 'EMP-0003' }
  ]);
  await Training.create([
    { name: 'Information Security Awareness', category: 'Compliance', duration: '4 Hours', progress: 0, status: 'assigned', empId: 'EMP-0002', trainer: 'Internal – IT Security', date: daysFromToday(6) },
    { name: 'Advanced Node.js Performance', category: 'Technical', duration: '6 Hours', progress: 100, status: 'attended', empId: 'EMP-0002', trainer: 'Internal – Engineering', date: daysFromToday(-20), rating: 5, review: 'Practical and well paced.' }
  ]);
  await DiscussionMessage.create([
    { senderId: 'EMP-0001', senderName: 'Venkat Raman', senderRole: 'hr', message: 'Reminder: please keep your profile and emergency contacts up to date.', time: '10:15' },
    { senderId: 'EMP-0006', senderName: 'Kavitha Iyer', senderRole: 'employee', message: 'Engineering all-hands moves to Thursday 4 pm this week.', time: '11:40' }
  ]);

  console.log(`Done: ${PEOPLE.length} employees, ${sheets.length} attendance records, ${leaves.length} leaves, ${cands.length} candidates.`);
  await mongoose.disconnect();
}

seed().catch(async (err) => { console.error('Seed failed:', err.message); await mongoose.disconnect(); process.exit(1); });
