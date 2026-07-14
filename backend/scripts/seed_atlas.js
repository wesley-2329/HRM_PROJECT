const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const CompanyMaster = require('../models/CompanyMaster');
const BranchMaster = require('../models/BranchMaster');
const BusinessUnitMaster = require('../models/BusinessUnitMaster');
const CostCenterMaster = require('../models/CostCenterMaster');
const Department = require('../models/Department');
const DesignationMaster = require('../models/DesignationMaster');
const GradeBandMaster = require('../models/GradeBandMaster');
const Employee = require('../models/Employee');
const Vacancy = require('../models/Vacancy');
const Candidate = require('../models/Candidate');
const VaultDocument = require('../models/VaultDocument');
const Leave = require('../models/Leave');
const Task = require('../models/Task');
const Training = require('../models/Training');
const Ticket = require('../models/Ticket');
const DiscussionMessage = require('../models/DiscussionMessage');
const SubDepartmentMaster = require('../models/SubDepartmentMaster');

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected successfully!\n');

  // 1. Clear non-employee collections to prevent duplicates
  console.log('Clearing old documents...');
  await CompanyMaster.deleteMany({});
  await BranchMaster.deleteMany({});
  await BusinessUnitMaster.deleteMany({});
  await CostCenterMaster.deleteMany({});
  await Department.deleteMany({});
  await DesignationMaster.deleteMany({});
  await GradeBandMaster.deleteMany({});
  await Vacancy.deleteMany({});
  await Candidate.deleteMany({});
  await VaultDocument.deleteMany({});
  await Leave.deleteMany({});
  await Task.deleteMany({});
  await Training.deleteMany({});
  await Ticket.deleteMany({});
  await DiscussionMessage.deleteMany({});
  await SubDepartmentMaster.deleteMany({});

  // Clean mock employees (EMP-0003 onwards) and keep default EMP-0001 & EMP-0002
  await Employee.deleteMany({ id: { $nin: ['EMP-0001', 'EMP-0002'] } });

  console.log('Creating Company, Branch, BU, and Cost Center masters...');
  // Company
  const company = await CompanyMaster.create({
    name: 'HRorbit Technologies',
    code: 'HO-001',
    businessType: 'Information Technology',
    status: 'Active'
  });

  // Branches
  const b1 = await BranchMaster.create({ name: 'HQ Bangalore', code: 'BLR-01', location: 'Bangalore, KA', branchHead: 'Venkat Raman', status: 'Active' });
  const b2 = await BranchMaster.create({ name: 'Tech Park Pune', code: 'PUN-02', location: 'Pune, MH', branchHead: 'Priya Nair', status: 'Active' });
  const b3 = await BranchMaster.create({ name: 'Innovation Hub Chennai', code: 'CHN-03', location: 'Chennai, TN', branchHead: 'Ramanathan S', status: 'Active' });

  // Business Units
  const bu1 = await BusinessUnitMaster.create({ name: 'Cloud Solutions', code: 'BU-CS', status: 'Active' });
  const bu2 = await BusinessUnitMaster.create({ name: 'Enterprise Apps', code: 'BU-EA', status: 'Active' });
  const bu3 = await BusinessUnitMaster.create({ name: 'Digital Commerce', code: 'BU-DC', status: 'Active' });

  // Cost Centers
  const cc1 = await CostCenterMaster.create({ name: 'Engineering CC', code: 'CC-ENG', status: 'Active' });
  const cc2 = await CostCenterMaster.create({ name: 'Operations CC', code: 'CC-OPS', status: 'Active' });
  const cc3 = await CostCenterMaster.create({ name: 'HR Operations CC', code: 'CC-HR', status: 'Active' });

  console.log('Creating Grade Bands and Designations...');
  // Grade Bands
  const g1 = await GradeBandMaster.create({ name: 'L1', description: 'Entry-level Analyst/Engineer', status: 'Active' });
  const g2 = await GradeBandMaster.create({ name: 'L2', description: 'Senior Consultant/Engineer', status: 'Active' });
  const g3 = await GradeBandMaster.create({ name: 'L3', description: 'Lead Consultant/Architect', status: 'Active' });
  const g4 = await GradeBandMaster.create({ name: 'L4', description: 'Manager/Director', status: 'Active' });

  // Designations
  await DesignationMaster.create({ name: 'Software Engineer', code: 'SE', deptMapping: 'Engineering', gradeMapping: 'L1', positionLimit: 50, status: 'Active' });
  await DesignationMaster.create({ name: 'Senior Software Engineer', code: 'SSE', deptMapping: 'Engineering', gradeMapping: 'L2', positionLimit: 30, status: 'Active' });
  await DesignationMaster.create({ name: 'Team Lead', code: 'TL', deptMapping: 'Engineering', gradeMapping: 'L3', positionLimit: 10, status: 'Active' });
  await DesignationMaster.create({ name: 'HR Specialist', code: 'HRS', deptMapping: 'Human Resources', gradeMapping: 'L1', positionLimit: 5, status: 'Active' });
  await DesignationMaster.create({ name: 'HR Manager', code: 'HRM', deptMapping: 'Human Resources', gradeMapping: 'L3', positionLimit: 2, status: 'Active' });

  console.log('Creating Departments...');
  // Departments
  const dEng = await Department.create({
    name: 'Engineering',
    code: 'DEPT-ENG',
    description: 'Software development, QA, DevOps, and Product Engineering',
    parentDept: '',
    managerId: 'EMP-0002',
    businessUnit: 'Cloud Solutions',
    location: 'HQ Bangalore',
    costCenter: 'Engineering CC',
    status: 'Active'
  });

  const dHR = await Department.create({
    name: 'Human Resources',
    code: 'DEPT-HR',
    description: 'People Operations, Recruitment, Payroll, and Compliance',
    parentDept: '',
    managerId: 'EMP-0001',
    businessUnit: 'Enterprise Apps',
    location: 'HQ Bangalore',
    costCenter: 'HR Operations CC',
    status: 'Active'
  });

  console.log('Populating Sub-Departments...');
  await SubDepartmentMaster.create({ name: 'Frontend Engineering', code: 'SUB-FE', parentDept: 'Engineering', managerId: 'EMP-0002', status: 'Active' });
  await SubDepartmentMaster.create({ name: 'Backend Engineering', code: 'SUB-BE', parentDept: 'Engineering', managerId: 'EMP-0002', status: 'Active' });
  await SubDepartmentMaster.create({ name: 'Talent Acquisition', code: 'SUB-TA', parentDept: 'Human Resources', managerId: 'EMP-0001', status: 'Active' });

  console.log('Adding Mock Employees to demonstrate Org Tree and Span of Control...');
  // Update EMP-0002 (Aditya Kumar) manager to EMP-0001 (Venkat Raman)
  const emp2 = await Employee.findOne({ id: 'EMP-0002' });
  if (emp2) {
    emp2.teamLeadId = 'EMP-0001';
    emp2.isTeamLead = true; // Let Aditya lead a sub-team
    emp2.branch = 'HQ Bangalore';
    emp2.businessUnit = 'Cloud Solutions';
    emp2.costCenter = 'Engineering CC';
    emp2.grade = 'L2';
    emp2.designation = 'Senior Software Engineer';
    await emp2.save();
  }

  // EMP-0003 (Reports to EMP-0002 Aditya Kumar)
  const emp3 = await Employee.create({
    id: 'EMP-0003',
    name: 'Priya Nair',
    role: 'employee',
    dept: 'Engineering',
    joined: '2022-03-01',
    email: 'priya@company.com',
    password: 'password123',
    status: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    aadhaar: '1111-2222-3333',
    phone: '+91 98765 00003',
    blood: 'B+',
    dob: '1998-05-12',
    gender: 'Female',
    teamLeadId: 'EMP-0002',
    branch: 'HQ Bangalore',
    businessUnit: 'Cloud Solutions',
    costCenter: 'Engineering CC',
    grade: 'L1',
    designation: 'Software Engineer'
  });

  // EMP-0004 (Reports to EMP-0002 Aditya Kumar)
  const emp4 = await Employee.create({
    id: 'EMP-0004',
    name: 'Rahul Sharma',
    role: 'employee',
    dept: 'Engineering',
    joined: '2023-01-15',
    email: 'rahul@company.com',
    password: 'password123',
    status: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    aadhaar: '4444-5555-6666',
    phone: '+91 98765 00004',
    blood: 'O-',
    dob: '1996-11-04',
    gender: 'Male',
    teamLeadId: 'EMP-0002',
    branch: 'Tech Park Pune',
    businessUnit: 'Cloud Solutions',
    costCenter: 'Engineering CC',
    grade: 'L1',
    designation: 'Software Engineer'
  });

  // EMP-0005 (Reports directly to EMP-0001 Venkat Raman in HR)
  const emp5 = await Employee.create({
    id: 'EMP-0005',
    name: 'Sneha Patel',
    role: 'employee',
    dept: 'Human Resources',
    joined: '2020-08-20',
    email: 'sneha@company.com',
    password: 'password123',
    status: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    aadhaar: '7777-8888-9999',
    phone: '+91 98765 00005',
    blood: 'AB+',
    dob: '1992-09-30',
    gender: 'Female',
    teamLeadId: 'EMP-0001',
    branch: 'HQ Bangalore',
    businessUnit: 'Enterprise Apps',
    costCenter: 'HR Operations CC',
    grade: 'L2',
    designation: 'HR Specialist'
  });

  console.log('Populating Recruitment ATS Candidates and Vacancies...');
  // Vacancies
  const v1 = await Vacancy.create({
    positionId: 'POS-1001',
    jobTitle: 'Senior Backend Developer (Node.js)',
    dept: 'Engineering',
    managerId: 'EMP-0002',
    status: 'Open',
    budget: 1800000,
    description: 'Build premium scale microservices using Express, NestJS, and Mongo.',
    priorityLevel: 'High',
    requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    vacancyReason: 'Addition to Cloud Solutions Team',
    approvedHeadcount: 2,
    vacancyCount: 2
  });

  const v2 = await Vacancy.create({
    positionId: 'POS-1002',
    jobTitle: 'HR Specialist (Talent Acquisition)',
    dept: 'Human Resources',
    managerId: 'EMP-0001',
    status: 'Open',
    budget: 800000,
    description: 'Source, screen, and interview candidates for high-performance software teams.',
    priorityLevel: 'Medium',
    requiredDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    vacancyReason: 'Replacement Request',
    approvedHeadcount: 1,
    vacancyCount: 1
  });

  // Candidates
  await Candidate.create({ name: 'Arjun Mehta', role: 'Senior Backend Developer (Node.js)', source: 'LinkedIn', experience: '6 Years', stage: 'applied', email: 'arjun@gmail.com', phone: '9999888877', skills: 'Node.js, Express, MongoDB, AWS' });
  await Candidate.create({ name: 'Divya Joshi', role: 'Senior Backend Developer (Node.js)', source: 'Naukri', experience: '5.5 Years', stage: 'screening', email: 'divya@gmail.com', phone: '9999888876', skills: 'Javascript, TypeScript, NestJS, SQL' });
  await Candidate.create({ name: 'Vikram Singh', role: 'Senior Backend Developer (Node.js)', source: 'Referral', experience: '7 Years', stage: 'interview', email: 'vikram@company.com', phone: '9999888875', skills: 'Node.js, GraphQL, Redis, Docker' });
  await Candidate.create({ name: 'Neha Reddy', role: 'HR Specialist (Talent Acquisition)', source: 'Indeed', experience: '3 Years', stage: 'offered', email: 'neha@indeed.com', phone: '9999888874', skills: 'ATS systems, Sourcing, Technical Interviewing' });
  await Candidate.create({ name: 'Siddharth Rao', role: 'Senior Backend Developer (Node.js)', source: 'LinkedIn', experience: '8 Years', stage: 'selected', email: 'siddharth@gmail.com', phone: '9999888873', skills: 'NestJS, Microservices, Kubernetes' });

  console.log('Populating Leave Applications...');
  // Leaves
  await Leave.create({
    empId: 'EMP-0002',
    empName: 'Aditya Kumar',
    type: 'Sick',
    start: '2026-06-25',
    end: '2026-06-27',
    reason: 'Dental surgery and post-op rest',
    status: 'Pending'
  });

  await Leave.create({
    empId: 'EMP-0003',
    empName: 'Priya Nair',
    type: 'Earned',
    start: '2026-06-01',
    end: '2026-06-05',
    reason: 'Family wedding event',
    status: 'Approved'
  });

  console.log('Populating Vault Documents...');
  // Vault Documents
  await VaultDocument.create({
    employeeId: 'EMP-0002',
    employeeName: 'Aditya Kumar',
    documentName: 'Aadhaar Card',
    category: 'Identity',
    status: 'Approved',
    versions: [{
      versionNumber: 1,
      filePath: 'uploads/aadhaar_mock.pdf',
      fileName: 'aadhaar_mock.pdf',
      uploadedBy: 'EMP-0002',
      changeSummary: 'Initial upload'
    }],
    approvalWorkflow: {
      approvedBy: 'EMP-0001',
      approvedByName: 'Venkat Raman',
      approvedAt: new Date(),
      comments: 'Verified Aadhaar details'
    },
    auditTrail: [{
      action: 'Upload',
      userId: 'EMP-0002',
      userName: 'Aditya Kumar',
      details: 'Uploaded Version 1 of Aadhaar Card'
    }, {
      action: 'Approve',
      userId: 'EMP-0001',
      userName: 'Venkat Raman',
      details: 'Approved document Aadhaar Card'
    }]
  });

  await VaultDocument.create({
    employeeId: 'EMP-0003',
    employeeName: 'Priya Nair',
    documentName: 'Offer Letter',
    category: 'Employment',
    status: 'Pending Approval',
    versions: [{
      versionNumber: 1,
      filePath: 'uploads/offer_letter_mock.pdf',
      fileName: 'offer_letter_mock.pdf',
      uploadedBy: 'EMP-0003',
      changeSummary: 'Initial upload'
    }],
    auditTrail: [{
      action: 'Upload',
      userId: 'EMP-0003',
      userName: 'Priya Nair',
      details: 'Uploaded Version 1 of Offer Letter'
    }]
  });

  console.log('Populating Helpdesk Support Tickets...');
  // Tickets
  await Ticket.create({
    id: 'TCK-201',
    empId: 'EMP-0002',
    title: 'VPN Connection Issues',
    category: 'IT Support',
    priority: 'High',
    status: 'Open',
    raisedOn: '2026-06-24',
    response: ''
  });

  await Ticket.create({
    id: 'TCK-202',
    empId: 'EMP-0003',
    title: 'Payslip discrepancy for May',
    category: 'Payroll Help',
    priority: 'Medium',
    status: 'Open',
    raisedOn: '2026-06-23',
    response: 'Checking calculations with payroll vendor.'
  });

  console.log('Populating Tasks, Trainings, and Discussion Messages...');
  // Tasks
  await Task.create({
    title: 'Complete compliance questionnaire',
    project: 'Security Compliance',
    priority: 'Medium',
    due: '2026-06-26',
    progress: 0,
    status: 'todo',
    empId: 'EMP-0002'
  });
  await Task.create({
    title: 'Update project standup logs',
    project: 'HRorbit Portal',
    priority: 'Low',
    due: '2026-06-24',
    progress: 100,
    status: 'done',
    empId: 'EMP-0002'
  });

  // Trainings
  await Training.create({
    name: 'ISO 27001 Information Security Management',
    category: 'Compliance',
    duration: '4 Hours',
    progress: 0,
    status: 'assigned',
    empId: 'EMP-0002',
    trainer: 'CyberSafe Group',
    date: '2026-06-26'
  });
  await Training.create({
    name: 'Modern React Design Systems',
    category: 'Technical',
    duration: '6 Hours',
    progress: 100,
    status: 'attended',
    empId: 'EMP-0002',
    trainer: 'React Training Inc.',
    date: '2026-06-15',
    rating: 5,
    review: 'Excellent course, highly actionable.'
  });

  // Discussion Board Messages
  await DiscussionMessage.create({
    senderId: 'EMP-0001',
    senderName: 'Venkat Raman',
    senderRole: 'hr',
    message: 'Welcome to HRorbit portal. Please ensure all your profile details and documents are updated in the Vault by end of week!',
    time: '21:30'
  });
  await DiscussionMessage.create({
    senderId: 'EMP-0002',
    senderName: 'Aditya Kumar',
    senderRole: 'employee',
    message: 'Thanks Venkat! Logging in works seamlessly. Clocked in for today.',
    time: '21:35'
  });
  await DiscussionMessage.create({
    senderId: 'EMP-0003',
    senderName: 'Priya Nair',
    senderRole: 'employee',
    message: 'Agreed, the org structure view and ATS Kanban features look amazing.',
    time: '21:40'
  });

  console.log('\n======================================================');
  console.log('Database seeding successfully completed on Atlas!');
  console.log('======================================================');
  
  await mongoose.connection.close();
  console.log('Connection closed.');
}

seed().catch(err => {
  console.error('Seeding failed with error:');
  console.error(err);
  process.exit(1);
});
