// Showcase data for the demo database: fills every module that the base seed leaves empty, so a demo
// can walk through each feature from both logins. Called by seed_demo.js after the base data, on a
// *_demo (or local) database only. Ids start with DEMO- and free text says it is a demo record.
//
// The demo employee (Aditya Kumar, EMP-0002) leads EMP-0003 and EMP-0004, so his portal shows both
// his own records (goals, increment, recognition, welfare, documents, accepted policies) and team
// items to act on (daily reports to review, a leave waiting for his approval).
const mongoose = require('mongoose');
const m = (name) => require(`../models/${name}`);

const DAY = 864e5;
const at = (n) => new Date(Date.now() + n * DAY);
const ymd = (d) => d.toISOString().slice(0, 10);
const NOTE = 'Demo record for the preview environment.';

// A one-page PDF with a title line, so "View" on a seeded document opens a real file.
const pdf = (title) => {
  const text = title.replace(/[()\\]/g, '');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  const stream = `BT /F1 20 Tf 60 760 Td (${text}) Tj 0 -30 Td /F1 12 Tf (${NOTE}) Tj ET`;
  objs[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  let out = '%PDF-1.4\n';
  const offsets = objs.map((o, i) => { const off = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return off; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
};
const putFile = (bucketName, filename, buffer, metadata = {}) => new Promise((resolve, reject) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
  const id = new mongoose.Types.ObjectId();
  bucket.openUploadStreamWithId(id, filename, { contentType: 'application/pdf', metadata }).on('finish', () => resolve(id)).on('error', reject).end(buffer);
});

async function seedShowcase({ PEOPLE, nameOf }) {
  const P = Object.fromEntries(PEOPLE.map(p => [p[0], { id: p[0], name: p[1], dept: p[3], designation: p[4], grade: p[5], manager: p[6], joined: p[7] }]));
  const fyStart = (() => { const d = new Date(); return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; })();
  const FY = `FY ${fyStart}-${String(fyStart + 1).slice(-2)}`;
  const HRD = P['EMP-0001'];

  // ---------- Recruitment ----------
  await m('ManpowerRequisition').create([
    { reqNumber: 'DEMO-MRF-101', jobTitle: 'Senior Backend Developer', department: 'Engineering', reportingManagerId: 'EMP-0006', employmentType: 'Full-Time', vacancyCount: 2, annualCtcPerPosition: 1800000, targetHireDate: at(45), priorityLevel: 'High', status: 'Approved', assignedRecruiterId: 'EMP-0012', assignedDate: at(-10) },
    { reqNumber: 'DEMO-MRF-102', jobTitle: 'Payroll Analyst', department: 'Finance', reportingManagerId: 'EMP-0008', employmentType: 'Full-Time', vacancyCount: 1, annualCtcPerPosition: 900000, targetHireDate: at(60), priorityLevel: 'Medium', status: 'Finance Verified' },
    { reqNumber: 'DEMO-MRF-103', jobTitle: 'Growth Marketing Intern', department: 'Sales & Marketing', reportingManagerId: 'EMP-0010', employmentType: 'Intern', vacancyCount: 1, annualCtcPerPosition: 300000, targetHireDate: at(30), priorityLevel: 'Low', status: 'Submitted' }
  ]);
  await m('PositionApprovalRequest').create([
    { requestNumber: 'DEMO-PAR-201', positionTitle: 'Senior Backend Developer', department: 'Engineering', designation: 'Senior Software Engineer', grade: 'L2', proposedHeadcount: 2, orgValidationStatus: 'Valid', status: 'Approved', approverId: 'EMP-0001', approvalDate: at(-8) },
    { requestNumber: 'DEMO-PAR-202', positionTitle: 'Payroll Analyst', department: 'Finance', designation: 'Accounts Executive', grade: 'L1', proposedHeadcount: 1, orgValidationStatus: 'Validation Pending', status: 'Pending' }
  ]);
  await m('VacancyBudgetRequest').create([
    { budgetRequestNumber: 'DEMO-VBR-301', positionTitle: 'Senior Backend Developer', department: 'Engineering', costCenter: 'CC-ENG', annualCtcBudget: 3600000, budgetAvailability: 'Available', financeApprovalStatus: 'Approved', managementApprovalStatus: 'Approved', overallStatus: 'Approved' },
    { budgetRequestNumber: 'DEMO-VBR-302', positionTitle: 'Payroll Analyst', department: 'Finance', costCenter: 'CC-FIN', annualCtcBudget: 900000, budgetAvailability: 'Near Threshold', financeApprovalStatus: 'Pending', managementApprovalStatus: 'Pending', overallStatus: 'Pending' }
  ]);
  await m('RecruitmentCost').create([
    { costId: 'DEMO-RC-1', costCategory: 'Job Portal', department: 'Engineering', recruiterId: 'EMP-0012', amount: 45000, expenseDate: at(-20), financeApprovalStatus: 'Approved', paymentStatus: 'Paid' },
    { costId: 'DEMO-RC-2', costCategory: 'Consultancy', department: 'Engineering', recruiterId: 'EMP-0012', amount: 120000, expenseDate: at(-12), financeApprovalStatus: 'Approved', paymentStatus: 'Processing' },
    { costId: 'DEMO-RC-3', costCategory: 'Advertising', department: 'Sales & Marketing', recruiterId: 'EMP-0012', amount: 30000, expenseDate: at(-5), financeApprovalStatus: 'Pending', paymentStatus: 'Unpaid' }
  ]);
  await m('RecruitmentAuditLog').create([
    { entityType: 'ManpowerRequisition', entityId: 'DEMO-MRF-101', action: 'APPROVE', performedByUserId: 'EMP-0001' },
    { entityType: 'ManpowerRequisition', entityId: 'DEMO-MRF-101', action: 'ASSIGN', performedByUserId: 'EMP-0001' },
    { entityType: 'PositionApprovalRequest', entityId: 'DEMO-PAR-201', action: 'APPROVE', performedByUserId: 'EMP-0001' }
  ]);

  // ---------- Performance ----------
  const cycle = await m('AppraisalCycleMaster').create({ cycleName: `Annual Appraisal ${FY}`, cycleType: 'Annual', financialYear: FY, reviewPeriod: `Apr ${fyStart} – Mar ${fyStart + 1}`, startDate: new Date(Date.UTC(fyStart, 3, 1)), endDate: new Date(Date.UTC(fyStart + 1, 2, 31)), employeeCategory: 'All', status: 'Active' });
  const kras = await m('KraMaster').create([
    { kraId: 'DEMO-KRA-1', kraName: 'Delivery & Quality', goalCategory: 'Internal Process', status: 'Active' },
    { kraId: 'DEMO-KRA-2', kraName: 'Customer Impact', goalCategory: 'Customer', status: 'Active' },
    { kraId: 'DEMO-KRA-3', kraName: 'Learning & Mentoring', goalCategory: 'Learning & Growth', status: 'Active' }
  ]);
  const goal = (code, e, kra, target, weightage, goalStatus, status) => ({ goalCode: code, employeeId: e.id, employeeName: e.name, department: e.dept, designation: e.designation, reportingManagerId: e.manager, appraisalCycleId: String(cycle._id), kraId: kra.kraId, kraName: kra.kraName, target, weightage, priority: 'High', startDate: cycle.startDate, endDate: cycle.endDate, goalStatus, status });
  await m('EmployeeGoal').create([
    goal('DEMO-G-1', P['EMP-0002'], kras[0], 'Ship the payments service v2 with < 0.5% error rate', 40, 'On Track', 'Approved'),
    goal('DEMO-G-2', P['EMP-0002'], kras[1], 'Cut checkout latency by 30%', 35, 'In Progress', 'Approved'),
    goal('DEMO-G-3', P['EMP-0002'], kras[2], 'Mentor two engineers to independent delivery', 25, 'On Track', 'Approved'),
    goal('DEMO-G-4', P['EMP-0003'], kras[0], 'Own the notifications module end to end', 60, 'In Progress', 'Submitted'),
    goal('DEMO-G-5', P['EMP-0004'], kras[2], 'Complete the cloud certification', 40, 'At Risk', 'Approved')
  ]);
  await m('MidYearReview').create({ employeeId: 'EMP-0003', employeeName: nameOf['EMP-0003'], department: 'Engineering', designation: P['EMP-0003'].designation, reportingManagerId: 'EMP-0002', reportingManagerName: nameOf['EMP-0002'], appraisalCycleId: String(cycle._id), reviewPeriod: `Mid-Year Review ${FY}`, selfRating: 4, keyAchievements: 'Shipped notification digests.', employeeComments: NOTE, status: 'Submitted' });
  await m('PipRecord').create({ pipCode: 'DEMO-PIP-1', employeeId: 'EMP-0011', employeeName: nameOf['EMP-0011'], department: 'Sales & Marketing', designation: P['EMP-0011'].designation, reportingManagerId: 'EMP-0010', startDate: at(-20), endDate: at(40), performanceGap: 'Quarterly pipeline at 55% of target.', expectedPerformance: 'Reach 85% of pipeline target with weekly forecast hygiene.', actionPlan: 'Weekly deal reviews with the Marketing Lead; shadow two enterprise calls; CRM hygiene checklist.', reviewFrequency: 'Weekly', outcome: 'In Progress', employeeAcknowledged: true, acknowledgedDate: at(-19) });
  await m('PromotionRequest').create([
    { requestId: 'DEMO-PRM-1', employeeId: 'EMP-0003', employeeName: nameOf['EMP-0003'], currentDepartment: 'Engineering', currentDesignation: P['EMP-0003'].designation, currentGrade: 'L1', currentManagerId: 'EMP-0002', joiningDate: new Date(P['EMP-0003'].joined), proposedDesignation: 'Senior Software Engineer', proposedGrade: 'L2', proposedManagerId: 'EMP-0002', effectiveDate: at(30), justification: 'Consistently delivered the notifications module ahead of plan. ' + NOTE, status: 'Pending Approval' },
    { requestId: 'DEMO-PRM-2', employeeId: 'EMP-0005', employeeName: nameOf['EMP-0005'], currentDepartment: 'Human Resources', currentDesignation: P['EMP-0005'].designation, currentGrade: 'L1', currentManagerId: 'EMP-0001', joiningDate: new Date(P['EMP-0005'].joined), proposedDesignation: 'Senior HR Specialist', proposedGrade: 'L2', effectiveDate: at(-15), justification: 'Led the policy refresh programme. ' + NOTE, status: 'Approved', acceptanceDate: at(-10) }
  ]);
  await m('SalaryRevisionRequest').create([
    { requestId: 'DEMO-SR-1', employeeId: 'EMP-0002', employeeName: nameOf['EMP-0002'], currentDepartment: 'Engineering', currentDesignation: P['EMP-0002'].designation, currentManagerId: 'EMP-0006', revisionType: 'Annual Increment', effectiveDate: at(-30), reason: 'Annual cycle: exceeds expectations. ' + NOTE, revisedCtc: 2160000, incrementAmount: 180000, incrementPercentage: 9.1, status: 'Approved', acceptanceDate: at(-28) },
    { requestId: 'DEMO-SR-2', employeeId: 'EMP-0004', employeeName: nameOf['EMP-0004'], currentDepartment: 'Engineering', currentDesignation: P['EMP-0004'].designation, currentManagerId: 'EMP-0002', revisionType: 'Market Correction', effectiveDate: at(15), reason: 'Market benchmark for the role moved up. ' + NOTE, revisedCtc: 1150000, incrementAmount: 100000, incrementPercentage: 9.5, status: 'Pending Approval' }
  ]);

  // ---------- Engagement ----------
  await m('Communication').create([
    { communicationId: 'DEMO-COM-1', title: 'Annual Day on 12 December', category: 'Event', content: 'Join us at the Bangalore HQ lawn from 5 pm. Families welcome. ' + NOTE, publishDate: at(-3), expiryDate: at(25), status: 'Published', author: { id: HRD.id, name: HRD.name } },
    { communicationId: 'DEMO-COM-2', title: 'Updated Leave Policy', category: 'Policy Update', content: 'Earned leave carry-forward is now 15 days. See Policy Repository. ' + NOTE, publishDate: at(-10), expiryDate: at(80), status: 'Published', author: { id: HRD.id, name: HRD.name } },
    { communicationId: 'DEMO-COM-3', title: 'Open enrolment: health check-ups', category: 'Announcement', content: 'Free annual health check-ups for all staff this month. ' + NOTE, publishDate: at(-1), expiryDate: at(29), status: 'Published', author: { id: HRD.id, name: HRD.name } }
  ]);
  await m('RecognitionPost').create([
    { recognitionId: 'DEMO-REC-1', recipient: { id: 'EMP-0002', name: nameOf['EMP-0002'] }, recognizedBy: { id: 'EMP-0006', name: nameOf['EMP-0006'] }, category: 'Spot Award', appreciationMessage: 'For leading the payments migration with zero downtime.', date: at(-6), visibility: 'Company-wide' },
    { recognitionId: 'DEMO-REC-2', recipient: { id: 'EMP-0009', name: nameOf['EMP-0009'] }, recognizedBy: { id: 'EMP-0008', name: nameOf['EMP-0008'] }, category: 'Employee of the Month', appreciationMessage: 'Closed the quarter books two days early.', date: at(-14), visibility: 'Company-wide' },
    { recognitionId: 'DEMO-REC-3', recipient: { id: 'EMP-0012', name: nameOf['EMP-0012'] }, recognizedBy: { id: 'EMP-0001', name: nameOf['EMP-0001'] }, category: 'Birthday & Work Anniversary Wishes', appreciationMessage: 'Happy first work anniversary!', date: at(-2), visibility: 'Company-wide' }
  ]);
  await m('Suggestion').create([
    { suggestionId: 'DEMO-SUG-1', title: 'Quiet focus hours on Wednesdays', category: 'Process Improvement', description: 'No meetings 2–5 pm on Wednesdays. ' + NOTE, status: 'Under Review', priority: 'Medium', submittedBy: { id: 'EMP-0002', name: nameOf['EMP-0002'] } },
    { suggestionId: 'DEMO-SUG-2', title: 'Bike parking at Pune office', category: 'Workplace Environment', description: 'Covered two-wheeler parking near Gate 2. ' + NOTE, status: 'Implemented', priority: 'Low', submittedBy: { id: 'EMP-0007', name: nameOf['EMP-0007'] } }
  ]);
  await m('Grievance').create({ grievanceId: 'DEMO-GRV-1', category: 'Workplace Environment', subject: 'AC not working on 3rd floor', description: 'Bay C has been warm for a week. ' + NOTE, severity: 'Medium', raisedBy: { id: 'EMP-0004', name: nameOf['EMP-0004'] }, assignedOfficer: { id: 'EMP-0005', name: nameOf['EMP-0005'] }, status: 'Under Investigation' });
  await m('WelfareRequest').create([
    { requestId: 'DEMO-WR-1', welfareType: 'Education Support', description: 'Part-time cloud architecture course fee. ' + NOTE, amount: 40000, requestedBy: { id: 'EMP-0002', name: nameOf['EMP-0002'] }, status: 'HR Verified' },
    { requestId: 'DEMO-WR-2', welfareType: 'Medical Assistance', description: 'Hospitalisation support for a family member. ' + NOTE, amount: 60000, requestedBy: { id: 'EMP-0009', name: nameOf['EMP-0009'] }, status: 'Benefit Issued' }
  ]);

  // ---------- Budgeting: welfare ----------
  await m('WelfareBudget').create([
    ['Health Check-up', 'Human Resources', 'CC-HR', 300000, 280000, 'Approved'],
    ['Festival Celebrations', 'Human Resources', 'CC-HR', 250000, 250000, 'Approved'],
    ['Sports & Recreation', 'Engineering', 'CC-ENG', 150000, 0, 'Submitted']
  ].map(([welfareCategory, department, costCenter, proposedBudget, approvedBudget, status], i) =>
    ({ welfareBudgetId: `DEMO-WB-${i + 1}`, financialYear: FY, department, costCenter, welfareCategory, proposedBudget, approvedBudget, status })));

  // ---------- Statutory compliance ----------
  await m('StatutoryActMaster').create([
    ['PF', 'Employees\' Provident Funds Act, 1952', 'Monthly'], ['ESI', 'Employees\' State Insurance Act, 1948', 'Monthly'],
    ['PT', 'Karnataka Professional Tax Act', 'Monthly'], ['LWF', 'Karnataka Labour Welfare Fund Act', 'Annual']
  ].map(([actCode, actName, frequency], i) => ({ actId: `DEMO-ACT-${i + 1}`, actCode, actName, frequency, status: 'Active' })));
  const staff = Object.values(P);
  await m('EmployeePfProfile').create(staff.map((e, i) => ({ pfProfileId: `DEMO-PF-${i + 1}`, employeeId: e.id, employeeName: e.name, uan: `1009${String(87654321 + i)}`, pfMemberId: `KN/BLR/0012345/000/${String(100 + i)}`, joiningDate: new Date(e.joined), kycStatus: i % 5 === 3 ? 'Pending' : 'Verified', nominationStatus: i % 4 === 2 ? 'Pending' : 'Completed', status: 'Active' })));
  await m('EmployeeEsiProfile').create(staff.filter((_, i) => i % 3 === 0 || ['EMP-0002'].includes(staff[i].id)).map((e, i) => ({ esiProfileId: `DEMO-ESI-${i + 1}`, employeeId: e.id, employeeName: e.name, ipNumber: `5300${String(123456 + i)}`, joiningDate: new Date(e.joined), grossWage: 20000, status: 'Active' })));
  await m('EmployeePtProfile').create(staff.map((e, i) => ({ ptProfileId: `DEMO-PT-${i + 1}`, employeeId: e.id, employeeName: e.name, state: e.dept === 'Engineering' ? 'Maharashtra' : 'Karnataka', monthlyDeduction: 200, status: 'Active' })));
  await m('EmployeeLwfProfile').create(staff.map((e, i) => ({ lwfProfileId: `DEMO-LWF-${i + 1}`, employeeId: e.id, employeeName: e.name, state: e.dept === 'Engineering' ? 'Maharashtra' : 'Karnataka', contributionFrequency: 'Half-Yearly', employeeContribution: 12, employerContribution: 36, status: 'Active' })));
  for (const [i, [title, category, expiry]] of [['PF registration certificate', 'Registration Certificate', 900], ['Shops & Establishments licence', 'Labour License', 45]].entries()) {
    const fileId = await putFile('compliance_files', `${title}.pdf`, pdf(title), { demo: true });
    await m('ComplianceDocument').create({ docId: `DEMO-CDOC-${i + 1}`, title, category, fileId, fileName: `${title}.pdf`, fileSize: pdf(title).length, expiryDate: at(expiry) });
  }

  // ---------- Document vault: uploads waiting for HR verification ----------
  for (const [empId, documentName, category, status] of [['EMP-0002', 'PAN Card', 'Identity', 'Pending Approval'], ['EMP-0002', 'Degree Certificate', 'Education', 'Approved'], ['EMP-0003', 'Aadhaar Card', 'Identity', 'Pending Approval'], ['EMP-0012', 'Previous Employer Relieving Letter', 'Employment', 'Pending Approval']]) {
    const fileName = `${documentName}.pdf`;
    const fileId = await putFile('vaultFiles', fileName, pdf(`${documentName} – ${nameOf[empId]}`), { employeeId: empId, documentName, uploadedBy: empId });
    await m('VaultDocument').create({ employeeId: empId, employeeName: nameOf[empId], documentName, category, status, versions: [{ versionNumber: 1, filePath: `gridfs:${fileId}`, fileName, uploadedBy: empId, changeSummary: 'Initial upload' }], auditTrail: [{ action: 'Upload', userId: empId, userName: nameOf[empId], details: `Uploaded Version 1 of '${documentName}'` }] });
  }

  // ---------- Policies: everyone has accepted except two staff on the newest one. The demo employee
  // has accepted all, because a pending policy puts a full-screen acceptance lock on sign-in
  // (publish a new policy as HR during a demo to show that lock). ----------
  const policies = await m('CompanyPolicy').create([
    { name: 'Code of Conduct', content: 'Treat colleagues, customers and partners with respect; report conflicts of interest. ' + NOTE, effectiveDate: at(-200), lastUpdatedDate: at(-30), status: 'Active' },
    { name: 'Leave Policy', content: 'Casual 12, Sick 12, Earned 15 days per year; up to 15 Earned days carry forward. ' + NOTE, effectiveDate: at(-180), lastUpdatedDate: at(-10), status: 'Active' },
    { name: 'Information Security Policy', content: 'Lock screens, use the password manager, report phishing to IT. ' + NOTE, effectiveDate: at(-90), lastUpdatedDate: at(-5), status: 'Active' }
  ]);
  const acks = [];
  for (const e of staff) for (const [i, pol] of policies.entries()) {
    if (i === 2 && ['EMP-0004', 'EMP-0011'].includes(e.id)) continue;
    acks.push({ employeeId: e.id, employeeName: e.name, department: e.dept, policyId: pol._id, policyName: pol.name, policyVersion: 1, status: 'Accepted' });
  }
  await m('PolicyAcknowledgement').create(acks);

  // ---------- Workforce lifecycle ----------
  await m('EmployeeProbation').create([
    { employeeId: 'EMP-0012', employeeName: nameOf['EMP-0012'], employeeCode: 'EMP-0012', department: 'Human Resources', designation: P['EMP-0012'].designation, joiningDate: new Date(P['EMP-0012'].joined), employeeCategory: 'Probationer', probationEndDate: at(12), reportingManagerId: 'EMP-0001', reportingManagerName: nameOf['EMP-0001'], status: 'Review Pending' },
    { employeeId: 'EMP-0011', employeeName: nameOf['EMP-0011'], employeeCode: 'EMP-0011', department: 'Sales & Marketing', designation: P['EMP-0011'].designation, joiningDate: new Date(P['EMP-0011'].joined), employeeCategory: 'Probationer', probationEndDate: at(-20), reportingManagerId: 'EMP-0010', reportingManagerName: nameOf['EMP-0010'], status: 'Extended' }
  ]);
  await m('GradeMovementRequest').create({ employeeId: 'EMP-0009', employeeName: nameOf['EMP-0009'], department: 'Finance', currentGrade: 'L1', proposedGrade: 'L2', currentBand: 'Associate', proposedBand: 'Senior', reason: 'Took over vendor payments end to end. ' + NOTE, effectiveDate: at(20), status: 'Pending Approval' });
  await m('TransferRequest').create({ transferNumber: 'DEMO-TRF-1', employeeId: 'EMP-0007', employeeName: nameOf['EMP-0007'], currentDepartment: 'Engineering', currentDesignation: P['EMP-0007'].designation, currentManagerId: 'EMP-0006', transferType: 'Inter Location Transfer', transferReason: 'Relocating to Bangalore; QA team expansion at HQ. ' + NOTE, effectiveDate: at(25), status: 'Pending Approval', newManagerId: 'EMP-0006' });

  // ---------- Meetings, daily reports, warning letter ----------
  await m('Meeting').create([
    { title: 'Payments v2 design review', host: nameOf['EMP-0006'], date: ymd(at(1)), time: '11:00', type: 'Online', empId: 'EMP-0002,EMP-0003,EMP-0004', link: 'https://meet.example.com/demo-review', agenda: 'Error budgets, rollout plan. ' + NOTE, status: 'Scheduled' },
    { title: 'Quarterly 1:1', host: nameOf['EMP-0006'], date: ymd(at(3)), time: '16:30', type: 'Online', empId: 'EMP-0002', link: 'https://meet.example.com/demo-1on1', agenda: 'Goals check-in. ' + NOTE, status: 'Scheduled' },
    { title: 'Sprint retrospective', host: nameOf['EMP-0002'], date: ymd(at(-2)), time: '15:00', type: 'Online', empId: 'EMP-0002,EMP-0003,EMP-0004,EMP-0007', link: 'https://meet.example.com/demo-retro', status: 'Attended' }
  ]);
  await m('DailyReport').create([
    ...['EMP-0003', 'EMP-0004'].map((id, i) => ({ empId: id, empName: nameOf[id], empEmail: `${nameOf[id].split(' ')[0].toLowerCase()}.${id.slice(-4)}@company.com`, teamLeadId: 'EMP-0002', date: ymd(at(-1)), hoursWorked: 8, tasksCompleted: ['Wrote integration tests for digest emails.', 'Fixed retry logic in the payments webhook.'][i], blockers: i ? 'Waiting for staging credentials.' : '', status: 'Pending Review' })),
    { empId: 'EMP-0002', empName: nameOf['EMP-0002'], empEmail: 'employee@company.com', teamLeadId: 'EMP-0006', date: ymd(at(-1)), hoursWorked: 9, tasksCompleted: 'Reviewed 4 PRs; finalised rollout plan for payments v2.', status: 'Reviewed' }
  ]);
  await m('WarningLetter').create({ empId: 'EMP-0011', empName: nameOf['EMP-0011'], subject: 'Repeated late log-ins', reason: 'Five late log-ins in October without notice. ' + NOTE, date: ymd(at(-25)), status: 'Acknowledged' });

  // ---------- HR audit, action items, observations ----------
  await m('Audit').create([
    { auditNumber: 'DEMO-AUD-1', name: 'Statutory registers review', type: 'Compliance Audit', category: 'Statutory', date: at(-40), department: 'Human Resources', auditorName: 'Demo Auditor', status: 'Closed' },
    { auditNumber: 'DEMO-AUD-2', name: 'Onboarding documentation check', type: 'Internal Audit', category: 'Process', date: at(-5), department: 'Human Resources', auditorName: nameOf['EMP-0005'], status: 'Actions Pending' }
  ]);
  await m('ActionClosureTracker').create([
    { observationId: 'DEMO-ACT-1', observationType: 'Audit Observation', department: 'Human Resources', description: 'Two new joiners missing signed NDAs. ' + NOTE, priority: 'High', status: 'In Progress', creatorId: 'EMP-0005', creatorName: nameOf['EMP-0005'], assignedToId: 'EMP-0012', dueDate: at(7) },
    { observationId: 'DEMO-ACT-2', observationType: 'Compliance Observation', department: 'Human Resources', description: 'Update abstracts displayed at the Pune office. ' + NOTE, priority: 'Medium', status: 'Closed', creatorId: 'EMP-0001', creatorName: nameOf['EMP-0001'], assignedToId: 'EMP-0005', dueDate: at(-10), closureDate: at(-12) }
  ]);
  await m('ObservationTracker').create([
    { observationId: 'DEMO-OBS-1', title: 'Fire exit signage faded', description: 'Signage near stairwell B needs replacement. ' + NOTE, department: 'Engineering', category: 'Safety', priority: 'Medium', status: 'Assigned', creatorId: 'EMP-0001', creatorName: nameOf['EMP-0001'], assigneeId: 'EMP-0006', assignmentDate: at(-3), dueDate: at(10) },
    { observationId: 'DEMO-OBS-2', title: 'Visitor register incomplete', description: 'Exit times missing for last week. ' + NOTE, department: 'Human Resources', category: 'Admin', priority: 'Low', status: 'Closed', creatorId: 'EMP-0005', creatorName: nameOf['EMP-0005'], assigneeId: 'EMP-0012', assignmentDate: at(-15), dueDate: at(-5), completionDate: at(-6), closureDate: at(-6) }
  ]);

  // ---------- Approval routing: Engineering leave goes to the reporting manager, then HR ----------
  const matrix = await m('ApprovalMatrix').create({ moduleName: 'Attendance & Leave', processName: 'Leave', department: 'Engineering', levels: [{ levelNumber: 1, approverRole: 'Reporting Manager', slaDays: 2 }, { levelNumber: 2, approverRole: 'HR', slaDays: 2 }], effectiveDate: at(-60), status: 'Active', createdBy: 'EMP-0001', updatedBy: 'EMP-0001' });
  const routedLeave = await m('Leave').create({ empId: 'EMP-0003', empName: nameOf['EMP-0003'], type: 'Earned', start: ymd(at(9)), end: ymd(at(11)), reason: 'Family wedding. ' + NOTE, status: 'Pending' });
  await m('ApprovalAssignment').create({ transactionId: routedLeave._id, transactionSource: 'Leave', processName: 'Leave', requesterId: 'EMP-0003', requesterName: nameOf['EMP-0003'], requesterDept: 'Engineering', requesterRole: 'employee', matrixId: matrix._id, currentLevel: 1, status: 'Pending',
    levels: [{ levelNumber: 1, approverRole: 'Reporting Manager', assignedApprovers: ['EMP-0002'], status: 'Pending', slaDays: 2, dueDate: at(2) }, { levelNumber: 2, approverRole: 'HR', assignedApprovers: ['EMP-0001'], status: 'Pending', slaDays: 2, dueDate: at(4) }] });
  await m('PerformanceAuditLog').create([
    { moduleName: 'Appraisal, Increments & PIP', entityType: 'AppraisalCycleMaster', entityId: String(cycle._id), action: 'CREATE', performedByUserId: 'EMP-0001', performedByName: nameOf['EMP-0001'], performedByRole: 'hr', comments: `Opened ${cycle.cycleName}` },
    { moduleName: 'Appraisal, Increments & PIP', entityType: 'SalaryRevisionRequest', entityId: 'DEMO-SR-1', action: 'APPROVE', performedByUserId: 'EMP-0001', performedByName: nameOf['EMP-0001'], performedByRole: 'hr', comments: 'Approved annual increment for Aditya Kumar' },
    { moduleName: 'Appraisal, Increments & PIP', entityType: 'PipRecord', entityId: 'DEMO-PIP-1', action: 'PIP_UPDATE', performedByUserId: 'EMP-0010', performedByName: nameOf['EMP-0010'], performedByRole: 'employee', comments: 'Week 2 review logged' }
  ]);

  // ---------- Notifications for the demo employee ----------
  await m('Notification').create([
    { type: 'meeting', title: 'Meeting scheduled', desc: `Payments v2 design review on ${ymd(at(1))} at 11:00.`, empId: 'EMP-0002' },
    { type: 'reminder', title: 'Daily reports to review', desc: 'Priya Nair and Rahul Sharma submitted daily reports.', empId: 'EMP-0002' },
    { type: 'leave', title: 'Leave awaiting your approval', desc: `Priya Nair requested Earned leave from ${ymd(at(9))} to ${ymd(at(11))}.`, empId: 'EMP-0002' }
  ]);
}

module.exports = { seedShowcase };
