let mockEmployees = [
  {
    _id: "60c72b2f9b1d8b2a3c9d8001",
    id: "EMP-1001",
    name: "Gara Nandini",
    role: "hr",
    dept: "Human Resources",
    joined: "2018-05-10",
    email: "garanandini067@gmail.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    aadhaar: "4567-8901-2345",
    phone: "+91 98765 00001",
    blood: "A+",
    dob: "1980-04-15",
    gender: "Male",
    designation: "HR Manager",
    branch: "HQ Bangalore",
    businessUnit: "Enterprise Apps",
    costCenter: "HR Operations CC"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8002",
    id: "EMP-1002",
    name: "Akhil Sirivella",
    role: "hr",
    dept: "Human Resources",
    joined: "2018-05-10",
    email: "akhilsirivella510@gmail.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    aadhaar: "4567-8901-2345",
    phone: "+91 98765 00001",
    blood: "A+",
    dob: "1980-04-15",
    gender: "Male",
    designation: "HR Manager",
    branch: "HQ Bangalore",
    businessUnit: "Enterprise Apps",
    costCenter: "HR Operations CC"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8003",
    id: "EMP-1003",
    name: "Karthik Potur",
    role: "hr",
    dept: "Human Resources",
    joined: "2018-05-10",
    email: "karthikpotur@gmail.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    aadhaar: "4567-8901-2345",
    phone: "+91 98765 00001",
    blood: "A+",
    dob: "1980-04-15",
    gender: "Male",
    designation: "HR Manager",
    branch: "HQ Bangalore",
    businessUnit: "Enterprise Apps",
    costCenter: "HR Operations CC"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8009",
    id: "EMP-1005",
    name: "Sujatha Subramani",
    role: "hr",
    dept: "Human Resources",
    joined: "2024-01-15",
    email: "sujatha.subramani98@gmail.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    aadhaar: "4567-8901-2345",
    phone: "+91 98765 00001",
    blood: "A+",
    dob: "1985-06-20",
    gender: "Female",
    designation: "HR Manager",
    branch: "HQ Bangalore",
    businessUnit: "Enterprise Apps",
    costCenter: "HR Operations CC"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8004",
    id: "EMP-1004",
    name: "John Wesley",
    role: "hr",
    dept: "Human Resources",
    joined: "2018-05-10",
    email: "johnwesley.290305@gmail.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    aadhaar: "4567-8901-2345",
    phone: "+91 98765 00001",
    blood: "A+",
    dob: "1980-04-15",
    gender: "Male",
    designation: "HR Manager",
    branch: "HQ Bangalore",
    businessUnit: "Enterprise Apps",
    costCenter: "HR Operations CC"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8005",
    id: "EMP-2001",
    name: "Priyanka",
    role: "employee",
    dept: "Engineering",
    joined: "2021-06-15",
    email: "priyanka@qbkartitsolutions.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    aadhaar: "1234-5678-9012",
    phone: "+91 98765 00002",
    blood: "O+",
    dob: "1995-08-20",
    gender: "Male",
    designation: "Senior Software Engineer",
    branch: "HQ Bangalore",
    businessUnit: "Cloud Solutions",
    costCenter: "Engineering CC",
    teamLeadId: "EMP-1004",
    isTeamLead: true
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8006",
    id: "EMP-2002",
    name: "Pranitha",
    role: "employee",
    dept: "Engineering",
    joined: "2021-06-15",
    email: "pranitha@qbkartitsolutions.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    aadhaar: "1234-5678-9012",
    phone: "+91 98765 00002",
    blood: "O+",
    dob: "1995-08-20",
    gender: "Male",
    designation: "Senior Software Engineer",
    branch: "HQ Bangalore",
    businessUnit: "Cloud Solutions",
    costCenter: "Engineering CC",
    teamLeadId: "EMP-1004",
    isTeamLead: true
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8007",
    id: "EMP-2003",
    name: "Dhanush Goud",
    role: "employee",
    dept: "Engineering",
    joined: "2021-06-15",
    email: "dhanushgoud58@gmail.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    aadhaar: "1234-5678-9012",
    phone: "+91 98765 00002",
    blood: "O+",
    dob: "1995-08-20",
    gender: "Male",
    designation: "Senior Software Engineer",
    branch: "HQ Bangalore",
    businessUnit: "Cloud Solutions",
    costCenter: "Engineering CC",
    teamLeadId: "EMP-1004",
    isTeamLead: true
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d8008",
    id: "EMP-2004",
    name: "John Wesley",
    role: "employee",
    dept: "Engineering",
    joined: "2021-06-15",
    email: "johnwesley.290305@gmail.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    aadhaar: "1234-5678-9012",
    phone: "+91 98765 00002",
    blood: "O+",
    dob: "1995-08-20",
    gender: "Male",
    designation: "Senior Software Engineer",
    branch: "HQ Bangalore",
    businessUnit: "Cloud Solutions",
    costCenter: "Engineering CC",
    teamLeadId: "EMP-1004",
    isTeamLead: true
  }
];

let mockLeaves = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7901",
    employeeId: "EMP-2001",
    empId: "EMP-2001",
    employeeName: "Priyanka",
    leaveType: "Sick Leave",
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    reason: "Fever and flu",
    status: "Approved"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d7902",
    employeeId: "EMP-2002",
    empId: "EMP-2002",
    employeeName: "Pranitha",
    leaveType: "Casual Leave",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    reason: "Family gathering",
    status: "Pending"
  }
];

let mockTasks = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7911",
    title: "Configure Vercel Routing",
    description: "Revert multi-project setup to classic v2 builds format to resolve deployment crashes.",
    assignedTo: "EMP-2001",
    assignedToName: "Priyanka",
    dueDate: "2026-07-15",
    priority: "High",
    status: "Completed"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d7912",
    title: "Implement Leave Balance Tracker",
    description: "Add leave balance updates inside client-side components.",
    assignedTo: "EMP-2002",
    assignedToName: "Pranitha",
    dueDate: "2026-07-18",
    priority: "Medium",
    status: "In Progress"
  }
];

let mockTickets = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7921",
    ticketId: "TCK-1001",
    title: "VPN Access Rejected",
    description: "Unable to connect to Pune staging router. IP selection throws authentication handshake error.",
    category: "IT Support",
    priority: "High",
    status: "Open",
    employeeId: "EMP-2001",
    empId: "EMP-2001",
    employeeName: "Priyanka",
    createdAt: "2026-07-14T10:00:00.000Z"
  }
];

let mockMeetings = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7931",
    title: "Daily Standup Meeting",
    date: "2026-07-15",
    time: "10:00 AM",
    duration: 30,
    participants: ["EMP-1004", "EMP-2001", "EMP-2002"],
    description: "Discuss checklist deliverables and tasks.",
    link: "https://meet.hro.company/join/tck-standup"
  }
];

let mockTrainings = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7941",
    title: "Express and Serverless Deployments",
    description: "Best practices for deploying express applications to serverless environments.",
    trainer: "Tech Lead",
    startDate: "2026-07-12",
    endDate: "2026-07-16",
    status: "In Progress"
  }
];

let mockTimesheets = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7951",
    empId: "EMP-2001",
    date: "2026-07-14",
    clockIn: "09:05 AM",
    clockOut: "06:15 PM",
    hours: 9,
    status: "Punctual"
  }
];

let mockVaultDocs = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7961",
    docName: "Aadhaar Card Copy",
    docType: "Identification",
    uploadedBy: "EMP-2001",
    uploadedByName: "Priyanka",
    status: "Approved",
    currentVersion: 1,
    versions: [{ version: 1, path: "/tmp/uploads/emp2_aadhaar.pdf", date: "2026-07-14" }]
  }
];

let mockChats = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7971",
    senderId: "EMP-1004",
    senderName: "John Wesley",
    message: "Hi Team, please ensure your checklists are updated.",
    timestamp: "2026-07-14T10:30:00.000Z"
  }
];

let mockNotifications = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7981",
    userId: "EMP-2001",
    title: "Task Assigned",
    message: "You have been assigned: Configure Vercel Routing",
    read: false,
    createdAt: "2026-07-14T09:12:00.000Z"
  }
];

let mockDiscussions = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7991",
    title: "HR O Portal Release Notes",
    content: "Welcome to the new HR O communication board! Use this channel to post cross-functional updates.",
    authorId: "EMP-1004",
    authorName: "John Wesley",
    createdAt: "2026-07-14T11:00:00.000Z",
    replies: []
  }
];

let mockWarnings = [];

let mockCompany = [
  { _id: "60c72b2f9b1d8b2a3c9d7a01", name: "HR O Technologies", code: "HO-001", businessType: "Information Technology", status: "Active" }
];

let mockBranches = [
  { _id: "60c72b2f9b1d8b2a3c9d7a11", name: "HQ Bangalore", code: "BLR-01", location: "Bangalore, KA", branchHead: "John Wesley", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a12", name: "Tech Park Pune", code: "PUN-02", location: "Pune, MH", branchHead: "Pranitha", status: "Active" }
];

let mockBUs = [
  { _id: "60c72b2f9b1d8b2a3c9d7a21", name: "Cloud Solutions", code: "BU-CS", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a22", name: "Enterprise Apps", code: "BU-EA", status: "Active" }
];

let mockCCs = [
  { _id: "60c72b2f9b1d8b2a3c9d7a31", name: "Engineering CC", code: "CC-ENG", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a32", name: "HR Operations CC", code: "CC-HR", status: "Active" }
];

let mockGradeBands = [
  { _id: "60c72b2f9b1d8b2a3c9d7a41", name: "L1", description: "Entry-level Analyst/Engineer", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a42", name: "L2", description: "Senior Consultant/Engineer", status: "Active" }
];

let mockDesignations = [
  { _id: "60c72b2f9b1d8b2a3c9d7a51", name: "Software Engineer", code: "SE", deptMapping: "Engineering", gradeMapping: "L1", positionLimit: 50, status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a52", name: "Senior Software Engineer", code: "SSE", deptMapping: "Engineering", gradeMapping: "L2", positionLimit: 30, status: "Active" }
];

let mockDepts = [
  { _id: "60c72b2f9b1d8b2a3c9d7a61", name: "Engineering", code: "DEPT-ENG", description: "Software development and engineering", parentDept: "", managerId: "EMP-2001", businessUnit: "Cloud Solutions", location: "HQ Bangalore", costCenter: "Engineering CC", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a62", name: "Human Resources", code: "DEPT-HR", description: "People Ops and Payroll", parentDept: "", managerId: "EMP-1004", businessUnit: "Enterprise Apps", location: "HQ Bangalore", costCenter: "HR Operations CC", status: "Active" }
];

let mockSubDepts = [
  { _id: "60c72b2f9b1d8b2a3c9d7a71", name: "Frontend Engineering", code: "SUB-FE", parentDept: "Engineering", managerId: "EMP-2001", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a72", name: "Backend Engineering", code: "SUB-BE", parentDept: "Engineering", managerId: "EMP-2001", status: "Active" }
];

let mockFloors = [
  { _id: "60c72b2f9b1d8b2a3c9d7a81", name: "4th Floor", code: "FLR-04", building: "Building A", status: "Active" }
];

let mockBuildings = [
  { _id: "60c72b2f9b1d8b2a3c9d7a91", name: "Building A", code: "BLDG-A", status: "Active" }
];

let mockRegions = [
  { _id: "60c72b2f9b1d8b2a3c9d7aa1", name: "India East", code: "REG-IE", status: "Active" }
];

let mockTeams = [
  { _id: "60c72b2f9b1d8b2a3c9d7ab1", name: "Core Developers", code: "TM-DEV", status: "Active" }
];

let mockPositions = [
  { _id: "60c72b2f9b1d8b2a3c9d7ac1", name: "Fullstack Engineer", code: "POS-FE", status: "Active" }
];

let mockPolicies = [
  { _id: "60c72b2f9b1d8b2a3c9d7ad1", title: "Information Security Policy", content: "Guidelines on data handling and system security.", status: "Active" }
];

let mockOrgDocs = [];
let mockSuccessionPlans = [];
let mockHeadcountPlans = [];
let mockAuditLogs = [];

let mockManpowerRequisitions = [
  {
    _id: "60c72b2f9b1d8b2a3c9d9001",
    reqNumber: "REQ-2026-0001",
    jobTitle: "Senior Full Stack Engineer",
    department: "Engineering",
    grade: "Grade C",
    designation: "Senior Software Engineer",
    costCenter: "CC-101",
    employmentType: "Full-Time",
    vacancyCount: 3,
    annualCtcPerPosition: 1400000,
    totalBudgetEstimated: 4200000,
    targetHireDate: new Date("2026-09-15"),
    justification: "Expanding backend cloud platform infrastructure for Q3 product deliverables.",
    priorityLevel: "High",
    status: "Approved",
    currentApprovalStep: 4,
    approvals: [
      { step: 1, role: "Reporting Manager", approverName: "Akhil Sirivella", status: "Approved", comments: "Valid requirement" },
      { step: 2, role: "HR Verification", approverName: "Gara Nandini", status: "Approved", comments: "Headcount within limits" },
      { step: 3, role: "Finance Verification", approverName: "Karthik Potur", status: "Approved", comments: "Budget allocated" },
      { step: 4, role: "Management Approval", approverName: "Management", status: "Approved", comments: "Final signoff" }
    ],
    assignedRecruiterId: "EMP-1004",
    assignedRecruiterName: "John Wesley",
    assignedDate: new Date("2026-08-01"),
    deletedAt: null
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d9002",
    reqNumber: "REQ-2026-0002",
    jobTitle: "HR Operations Executive",
    department: "Human Resources",
    grade: "Grade B",
    designation: "HR Executive",
    costCenter: "CC-102",
    employmentType: "Full-Time",
    vacancyCount: 1,
    annualCtcPerPosition: 750000,
    totalBudgetEstimated: 750000,
    targetHireDate: new Date("2026-09-01"),
    justification: "To handle employee onboarding & compliance verification.",
    priorityLevel: "Medium",
    status: "HR Verified",
    currentApprovalStep: 3,
    approvals: [
      { step: 1, role: "Reporting Manager", approverName: "Sujatha Subramani", status: "Approved", comments: "Approved" },
      { step: 2, role: "HR Verification", approverName: "Gara Nandini", status: "Approved", comments: "Verified" },
      { step: 3, role: "Finance Verification", status: "Pending" },
      { step: 4, role: "Management Approval", status: "Pending" }
    ],
    assignedRecruiterId: "EMP-1005",
    assignedRecruiterName: "Sujatha Subramani",
    assignedDate: new Date("2026-08-05"),
    deletedAt: null
  }
];

let mockCandidates = [
  {
    _id: "60c72b2f9b1d8b2a3c9d9101",
    name: "Rahul Verma",
    role: "Senior Full Stack Engineer",
    source: "Job Portal",
    experience: "5.5 Years",
    stage: "interview",
    email: "rahul.verma@example.com",
    phone: "+91 98765 11223",
    currentCtc: 1000000,
    expectedCtc: 1400000,
    skills: "React.js, Node.js, Express, MongoDB, Docker, AWS",
    jdMatchScore: 88,
    offerReleased: "No",
    joiningStatus: "Not Joined",
    communicationLog: [
      { sender: "John Wesley", medium: "Email", message: "Scheduled technical interview round 1.", timestamp: new Date() }
    ],
    interviewHistory: [
      { roundName: "Technical Round 1", interviewerName: "Akhil Sirivella", scheduledDate: new Date(), status: "Passed", rating: 5, feedback: "Strong full-stack skills." }
    ],
    timeline: [
      { stage: "applied", title: "Applied via Naukri", description: "Candidate submitted profile", updatedBy: "System" },
      { stage: "screening", title: "Passed Screening", description: "Matched key skills", updatedBy: "John Wesley" }
    ],
    deletedAt: null
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d9102",
    name: "Priya Sharma",
    role: "UI/UX Designer",
    source: "Referral",
    experience: "4 Years",
    stage: "offered",
    email: "priya.sharma@example.com",
    phone: "+91 98765 44332",
    currentCtc: 850000,
    expectedCtc: 1100000,
    skills: "Figma, Adobe XD, Prototyping, Wireframing, CSS3",
    jdMatchScore: 92,
    offerReleased: "Yes",
    joiningStatus: "Pre-Onboarding",
    offerDetails: {
      offeredDesignation: "UI/UX Lead Designer",
      offeredCtc: 1150000,
      joiningDate: new Date("2026-09-01"),
      offerStatus: "Accepted"
    },
    communicationLog: [
      { sender: "Sujatha Subramani", medium: "Email", message: "Released official offer letter.", timestamp: new Date() }
    ],
    timeline: [
      { stage: "applied", title: "Applied via Referral", description: "Referred by EMP-1002", updatedBy: "System" },
      { stage: "offered", title: "Offer Letter Released", description: "Offer accepted by candidate", updatedBy: "Sujatha Subramani" }
    ],
    deletedAt: null
  }
];

let mockRecruitmentPositions = [
  {
    _id: "60c72b2f9b1d8b2a3c9d9201",
    requestNumber: "PR-2026-0001",
    positionTitle: "Lead DevOps Engineer",
    department: "Engineering",
    designation: "DevOps Lead",
    grade: "Grade D",
    reportingManager: "Akhil Sirivella",
    costCenter: "CC-101",
    currentHeadcount: 2,
    proposedHeadcount: 4,
    annualCtcBudget: 2200000,
    orgValidationStatus: "Valid",
    status: "Approved",
    deletedAt: null
  }
];

let mockVacancyBudgetRequests = [
  {
    _id: "60c72b2f9b1d8b2a3c9d9301",
    budgetRequestNumber: "BR-2026-0001",
    reqNumber: "REQ-2026-0001",
    positionTitle: "Senior Full Stack Engineer",
    department: "Engineering",
    costCenter: "CC-101",
    annualCtcBudget: 4200000,
    recruitmentCostBudget: 250000,
    totalFinancialImpact: 4450000,
    allocatedBudget: 4450000,
    utilizedBudget: 1450000,
    budgetAvailability: "Available",
    financeApprovalStatus: "Approved",
    managementApprovalStatus: "Approved",
    overallStatus: "Approved",
    deletedAt: null
  }
];

let mockResumeAnalyses = [];

let mockTalentPool = [
  {
    _id: "60c72b2f9b1d8b2a3c9d9401",
    candidateId: "60c72b2f9b1d8b2a3c9d9103",
    candidateName: "Vikram Reddy",
    email: "vikram.reddy@example.com",
    phone: "+91 98765 99887",
    primaryRole: "Cloud Architect",
    talentCategory: "Silver Medalist",
    skills: ["AWS", "Kubernetes", "Terraform", "Go"],
    experienceYears: 7,
    experienceCategory: "5-10 Years",
    candidateMatchRating: 5,
    status: "Active",
    expiryDate: new Date("2027-08-01"),
    deletedAt: null
  }
];

let mockRecruitmentCosts = [
  {
    _id: "60c72b2f9b1d8b2a3c9d9501",
    costId: "COST-2026-0001",
    costCategory: "Job Portal",
    vendorName: "Naukri.com Enterprise",
    department: "Engineering",
    costCenter: "CC-101",
    amount: 150000,
    expenseDate: new Date("2026-07-15"),
    paymentStatus: "Paid",
    financeApprovalStatus: "Approved",
    deletedAt: null
  }
];

let mockRecruitmentAuditLogs = [
  {
    _id: "60c72b2f9b1d8b2a3c9d9601",
    moduleName: "Recruitment & Onboarding",
    entityType: "Requisition",
    entityId: "REQ-2026-0001",
    action: "CREATE",
    performedByUserId: "EMP-1002",
    performedByName: "Akhil Sirivella",
    performedByRole: "HR Admin",
    comments: "Created Manpower Requisition for Senior Full Stack Engineer",
    ipAddress: "127.0.0.1",
    timestamp: new Date()
  }
];

let mockRecruitmentMasters = [
  { _id: "m1", category: "Department", code: "ENG", name: "Engineering", is_active: true },
  { _id: "m2", category: "Department", code: "HR", name: "Human Resources", is_active: true },
  { _id: "m3", category: "Department", code: "FIN", name: "Finance", is_active: true },
  { _id: "m4", category: "Employment Type", code: "FT", name: "Full-Time", is_active: true },
  { _id: "m5", category: "Recruitment Source", code: "JP", name: "Job Portal", is_active: true },
  { _id: "m6", category: "Recruitment Source", code: "REF", name: "Referral", is_active: true }
];

let mockAppraisalCycles = [
  {
    _id: "60c72b2f9b1d8b2a3c9e0001",
    cycleName: "Annual Performance Appraisal FY 2026-27",
    cycleType: "Annual",
    financialYear: "FY 2026-2027",
    reviewPeriod: "Apr 2026 - Mar 2027",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2027-03-31"),
    applicableCompany: "All Companies",
    businessUnit: "All Business Units",
    department: "All Departments",
    employeeCategory: "All Employees",
    status: "Active",
    deletedAt: null
  }
];

let mockRatingScales = [
  { _id: "rs1", scaleName: "5-Point Scale", ratingValue: 5, ratingLabel: "Outstanding", performanceCategory: "Outstanding", minScore: 90, maxScore: 100, status: "Active" },
  { _id: "rs2", scaleName: "5-Point Scale", ratingValue: 4, ratingLabel: "Exceeds Expectations", performanceCategory: "Exceeds Expectations", minScore: 75, maxScore: 89, status: "Active" },
  { _id: "rs3", scaleName: "5-Point Scale", ratingValue: 3, ratingLabel: "Meets Expectations", performanceCategory: "Meets Expectations", minScore: 60, maxScore: 74, status: "Active" },
  { _id: "rs4", scaleName: "5-Point Scale", ratingValue: 2, ratingLabel: "Needs Improvement", performanceCategory: "Needs Improvement", minScore: 45, maxScore: 59, status: "Active" },
  { _id: "rs5", scaleName: "5-Point Scale", ratingValue: 1, ratingLabel: "Unsatisfactory", performanceCategory: "Unsatisfactory", minScore: 0, maxScore: 44, status: "Active" }
];

let mockCompetencies = [
  { _id: "cp1", competencyCode: "CMP-001", competencyName: "Technical Excellence & Architecture", competencyType: "Core", description: "Design scalable cloud systems and deliver clean maintainable code.", weightage: 20, status: "Active" },
  { _id: "cp2", competencyCode: "CMP-002", competencyName: "Cross-Functional Collaboration", competencyType: "Behavioural", description: "Work seamlessly across Product, Design and Quality assurance.", weightage: 15, status: "Active" },
  { _id: "cp3", competencyCode: "CMP-003", competencyName: "Agile Leadership & Mentorship", competencyType: "Leadership", description: "Guide junior engineers and lead sprint planning sessions.", weightage: 15, status: "Active" }
];

let mockPerformanceTemplates = [
  { _id: "pt1", templateName: "Engineering Standard Template", department: "Engineering", designation: "All", grade: "All", kraWeightage: 40, kpiWeightage: 30, competencyWeightage: 20, behaviourWeightage: 10, status: "Active" }
];

let mockKras = [
  { _id: "k1", kraId: "KRA-2026-001", kraName: "Platform Infrastructure & Cloud Scalability", goalCategory: "Strategic", department: "Engineering", weightage: 40, targetValue: "99.9% Uptime", status: "Active" },
  { _id: "k2", kraId: "KRA-2026-002", kraName: "Product Delivery & Sprint Deadlines", goalCategory: "Internal Process", department: "Engineering", weightage: 30, targetValue: "100% On-Time", status: "Active" }
];

let mockKpis = [
  { _id: "kp1", kpiId: "KPI-2026-001", kpiName: "API Latency Reduction", kraId: "KRA-2026-001", target: "< 150ms Response", weightage: 15, measurementMethod: "Automated Metric", frequency: "Quarterly", status: "Active" },
  { _id: "kp2", kpiId: "KPI-2026-002", kpiName: "Zero Critical Security Vulnerabilities", kraId: "KRA-2026-001", target: "0 Critical Vulns", weightage: 15, measurementMethod: "Quarterly Audit", frequency: "Quarterly", status: "Active" }
];

let mockEmployeeGoals = [
  {
    _id: "g1",
    goalCode: "GOL-2026-0001",
    employeeId: "EMP-1002",
    employeeName: "Akhil Sirivella",
    department: "Human Resources",
    designation: "HR Manager",
    reportingManagerId: "EMP-1001",
    reportingManagerName: "Gara Nandini",
    appraisalCycleId: "60c72b2f9b1d8b2a3c9e0001",
    kraId: "KRA-2026-001",
    kraName: "HRMS Module Deployment & Automation",
    target: "Deploy Modules 1-6 seamlessly",
    weightage: 40,
    priority: "Critical",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2027-03-31"),
    achievementValue: "95%",
    achievementPct: 95,
    goalStatus: "On Track",
    status: "Approved",
    employeeComments: "All modules progressing smoothly according to sprint plan.",
    managerComments: "Excellent execution and leadership.",
    progressHistory: [
      { achievementValue: "50%", achievementPct: 50, status: "In Progress", employeeComments: "Halfway done", managerComments: "Good progress", updatedAt: new Date("2026-06-15") },
      { achievementValue: "95%", achievementPct: 95, status: "On Track", employeeComments: "Nearing release", managerComments: "Great work", updatedAt: new Date() }
    ],
    deletedAt: null
  }
];

let mockMidYearReviews = [
  {
    _id: "my1",
    employeeId: "EMP-1002",
    employeeName: "Akhil Sirivella",
    department: "Human Resources",
    designation: "HR Manager",
    reportingManagerId: "EMP-1001",
    reportingManagerName: "Gara Nandini",
    appraisalCycleId: "60c72b2f9b1d8b2a3c9e0001",
    reviewPeriod: "Mid-Year Review FY 2026-27",
    selfGoalAchievement: "Delivered Core HR and ATS modules ahead of schedule.",
    selfRating: 4,
    keyAchievements: "Automated recruitment approval steppers and offer letter engine.",
    majorChallenges: "Managing complex cross-department approval dependencies.",
    trainingCompleted: "Enterprise Cloud Architecture Masterclass",
    developmentNeeds: "Advanced Strategic Financial Management",
    employeeComments: "Very productive mid-year half.",
    managerRating: 5,
    strengths: "Architectural foresight, rapid delivery, zero downtime.",
    improvementAreas: "Delegate operational tasks to team leads.",
    managerComments: "Outstanding contribution during mid-year review cycle.",
    status: "Completed",
    deletedAt: null
  }
];

let mockAnnualReviews = [
  {
    _id: "ar1",
    employeeId: "EMP-1002",
    employeeName: "Akhil Sirivella",
    department: "Human Resources",
    designation: "HR Manager",
    grade: "Grade C",
    reportingManagerId: "EMP-1001",
    reportingManagerName: "Gara Nandini",
    appraisalCycleId: "60c72b2f9b1d8b2a3c9e0001",
    reviewPeriod: "Annual Review FY 2026-27",
    selfKraAchievement: "Exceeded all KRA milestones with 98% target delivery.",
    keyAccomplishments: "Spearheaded full HRMS enterprise application suite rollout.",
    managerKraScore: 92,
    managerKpiScore: 90,
    managerCompetencyScore: 95,
    managerBehaviourScore: 90,
    managerRating: 4.8,
    strengths: "Technical innovation, team motivation, domain knowledge.",
    improvementAreas: "Strategic long-term budgeting.",
    calculatedOverallScore: 91.8,
    weightedKraScore: 36.8,
    weightedKpiScore: 27.0,
    weightedCompetencyScore: 19.0,
    weightedBehaviourScore: 9.0,
    finalRating: 5.0,
    performanceCategory: "Outstanding",
    calibrationProposedRating: 5.0,
    calibrationFinalRating: 5.0,
    calibrationRemarks: "Unanimously approved for Outstanding performance distinction.",
    calibratedBy: "Calibration Committee",
    recommendedAction: "Promotion & Increment",
    acknowledgedByEmployee: true,
    employeeAcknowledgementDate: new Date(),
    employeeAcknowledgementComments: "Thankful for the evaluation and support.",
    status: "Published & Acknowledged",
    deletedAt: null
  }
];

let mockPipRecords = [
  {
    _id: "p1",
    pipCode: "PIP-2026-0001",
    employeeId: "EMP-1009",
    employeeName: "Rohan Das",
    department: "Sales & Marketing",
    designation: "Sales Executive",
    reportingManagerId: "EMP-1001",
    reportingManagerName: "Gara Nandini",
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-08-31"),
    durationDays: 60,
    performanceGap: "Quarterly sales target fell short by 45%.",
    expectedPerformance: "Achieve minimum 85% of monthly lead conversion quota.",
    actionPlan: "Weekly coaching sessions with Regional Sales Director & daily CRM updates.",
    reviewFrequency: "Bi-Weekly",
    objectives: [
      { objectiveName: "Lead Conversion Quota", target: "85% Conversion", weightage: 50, achievementPct: 80, status: "On Track", dueDate: new Date("2026-08-31") },
      { objectiveName: "Client Engagement Calls", target: "40 Calls / Week", weightage: 50, achievementPct: 90, status: "Completed", dueDate: new Date("2026-08-31") }
    ],
    periodicReviews: [
      { reviewDate: new Date("2026-07-15"), managerFeedback: "Showing positive trajectory in client outreach.", rating: "Satisfactory Progress", reviewedBy: "Gara Nandini" }
    ],
    outcome: "In Progress",
    employeeAcknowledged: true,
    deletedAt: null
  }
];

let mockPerformanceAuditLogs = [
  {
    _id: "pal1",
    moduleName: "Appraisal, Increments & PIP",
    entityType: "AnnualReview",
    entityId: "ar1",
    action: "CALIBRATE",
    performedByUserId: "EMP-1001",
    performedByName: "Gara Nandini",
    performedByRole: "HR Admin",
    comments: "Calibrated rating to 5.0 (Outstanding)",
    ipAddress: "127.0.0.1",
    timestamp: new Date()
  }
];

let mockPromotions = [
  {
    _id: "prm1",
    requestId: "PRM-2026-0001",
    employeeId: "EMP-1002",
    employeeName: "Akhil Sirivella",
    currentDepartment: "Human Resources",
    currentDesignation: "HR Manager",
    currentGrade: "Grade C",
    proposedDesignation: "Senior HR Director",
    proposedGrade: "Grade D",
    proposedDepartment: "Human Resources",
    effectiveDate: new Date("2026-09-01"),
    justification: "Exceptional leadership in delivering enterprise HRMS suite.",
    performanceSummary: "Rated 5.0 (Outstanding) in FY 2026-27 Annual Review.",
    currentSalary: 1800000,
    proposedSalary: 2400000,
    status: "Approved",
    approvalHistory: [
      { status: "Approved", actorName: "Management Committee", comments: "Promoted to Senior HR Director", timestamp: new Date() }
    ]
  }
];

let mockIncrements = [
  {
    _id: "srv1",
    requestId: "SRV-2026-0001",
    employeeId: "EMP-1002",
    employeeName: "Akhil Sirivella",
    currentDepartment: "Human Resources",
    currentDesignation: "HR Manager",
    currentGrade: "Grade C",
    revisionType: "Annual Increment",
    effectiveDate: new Date("2026-09-01"),
    reason: "Outstanding Performance Rating (5.0 / 5.0)",
    currentCtc: 1800000,
    currentGross: 1400000,
    currentBasic: 900000,
    revisedCtc: 2160000,
    revisedGross: 1680000,
    revisedBasic: 1080000,
    incrementAmount: 360000,
    incrementPercentage: 20,
    status: "Approved",
    approvalHistory: [
      { status: "Approved", actorName: "Finance & Payroll Team", comments: "Salary revision validated & integrated into payroll", timestamp: new Date() }
    ]
  }
];

let mockSuggestions = [
  {
    _id: "60c72b2f9b1d8b2a3c9e7001",
    suggestionId: "SUG-1001",
    title: "AI-Powered Automated Resume Parsing",
    category: "Process Improvement",
    description: "Automate resume screening using AI models to reduce hiring turnaround time by 40%.",
    businessImpact: "Saves 15 HR hours per requisition and improves candidate match score accuracy.",
    estimatedBenefit: "₹4,50,000 / Year",
    attachment: "",
    status: "Approved",
    priority: "High",
    submittedBy: { id: "EMP-1001", name: "Gara Nandini", email: "garanandini067@gmail.com", dept: "Human Resources" },
    reviewerComments: "Approved during Q3 Innovation Council meeting.",
    rewardBadge: "💡 Innovator of the Month",
    rewardPoints: 500,
    history: [{ action: "Approved", performedBy: "Akhil Sirivella", role: "hr", timestamp: new Date(), comments: "Approved for Q4 roadmap" }]
  },
  {
    _id: "60c72b2f9b1d8b2a3c9e7002",
    suggestionId: "SUG-1002",
    title: "Flexible Work from Anywhere Policy",
    category: "Policy & Welfare",
    description: "Allow 4 remote days per month for high-performing engineering & product teams.",
    businessImpact: "Boosts employee retention and satisfaction score.",
    estimatedBenefit: "Employee Wellbeing Boost",
    attachment: "",
    status: "Under Review",
    priority: "Medium",
    submittedBy: { id: "EMP-1004", name: "Divya Teja", email: "divya@hrorbit.com", dept: "Engineering" },
    history: [{ action: "Submitted", performedBy: "Divya Teja", role: "employee", timestamp: new Date() }]
  }
];

let mockGrievances = [
  {
    _id: "60c72b2f9b1d8b2a3c9e7010",
    grievanceId: "GRV-1001",
    category: "Workplace Ergonomics",
    subject: "Substandard Standing Desk Monitors in Wing B",
    description: "Flickering monitors causing eye strain during extended development sessions.",
    severity: "Medium",
    isConfidential: false,
    raisedBy: { id: "EMP-1002", name: "Akhil Sirivella", dept: "Human Resources" },
    assignedOfficer: { id: "EMP-1001", name: "Gara Nandini", role: "HR Manager" },
    status: "Assigned",
    investigationNotes: "IT & Admin team requested replacement 4K monitors.",
    resolution: "Replacement monitors dispatched on Aug 12.",
    closureDate: null,
    history: [{ status: "Assigned", actionBy: "Gara Nandini", role: "hr", notes: "Assigned to Admin IT lead" }]
  }
];

let mockHelpdeskTickets = [
  {
    _id: "60c72b2f9b1d8b2a3c9e7020",
    ticketId: "HD-1001",
    category: "IT Support",
    subcategory: "VPN & Network Access",
    subject: "VPN Authentication Timeout on Mac M2",
    description: "GlobalProtect client disconnects every 20 minutes when connected to Bangalore SG-1 gateway.",
    priority: "High",
    raisedBy: { id: "EMP-1003", name: "Karthik Potur", dept: "Software Engineering", email: "karthikpotur@gmail.com" },
    assignedTo: { id: "EMP-1001", name: "IT Helpdesk Team" },
    slaHours: 12,
    dueDate: new Date(Date.now() + 12 * 3600000),
    resolutionNotes: "Updated VPN profile configuration and re-issued client certificate.",
    rating: 5,
    status: "Resolved",
    history: [{ action: "Resolved", actor: "IT Helpdesk Team", comment: "Certificate re-issued" }]
  }
];

let mockWelfareRequests = [
  {
    _id: "60c72b2f9b1d8b2a3c9e7030",
    requestId: "WEL-1001",
    welfareType: "Emergency Fund",
    description: "Emergency medical advance for immediate family surgery hospitalization.",
    amount: 50000,
    documents: [{ name: "Hospital_Estimate.pdf", url: "#", uploadedAt: new Date() }],
    requestedBy: { id: "EMP-1002", name: "Akhil Sirivella", dept: "Human Resources" },
    status: "Benefit Issued",
    approvalRemarks: "Sanctioned under Special Corporate Welfare Fund.",
    verifier: "Gara Nandini",
    approver: "Management Board",
    history: [{ status: "Benefit Issued", updatedBy: "Finance Lead", remarks: "Funds transferred to bank account" }]
  }
];

let mockRecognitionPosts = [
  {
    _id: "60c72b2f9b1d8b2a3c9e7040",
    recognitionId: "REC-1001",
    recipient: { id: "EMP-1003", name: "Karthik Potur", dept: "Engineering", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    recognizedBy: { id: "EMP-1001", name: "Gara Nandini", dept: "Human Resources", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    category: "Spot Award",
    badge: "🏆 Outstanding Execution",
    appreciationMessage: "Karthik delivered the module migration single-handedly with zero downtime! Exceptional effort!",
    date: new Date(),
    visibility: "Company-wide",
    likes: ["EMP-1001", "EMP-1002"],
    comments: [
      { id: "EMP-1002", userName: "Akhil Sirivella", commentText: "Kudos Karthik! Well deserved!", createdAt: new Date() }
    ]
  }
];

let mockCommunications = [
  {
    _id: "60c72b2f9b1d8b2a3c9e7050",
    communicationId: "COM-1001",
    title: "HR orbit Q3 All-Hands Meeting & Annual Hackathon Announcement",
    category: "Announcement",
    content: "We are thrilled to announce our Q3 All-Hands townhall on Aug 20th followed by the annual 48-hour Innovation Hackathon!",
    targetAudience: "All Employees",
    publishDate: new Date(),
    expiryDate: null,
    attachment: "",
    acknowledgementRequired: true,
    status: "Published",
    author: { id: "EMP-1001", name: "Gara Nandini" }
  }
];

let mockCommunicationReadLogs = [];
let mockEngagementCategories = [];
let mockEngagementAuditLogs = [
  {
    _id: "60c72b2f9b1d8b2a3c9e7060",
    moduleName: "Employee Experience & Engagement",
    entityType: "Communication",
    entityId: "COM-1001",
    action: "Published",
    performedBy: { id: "EMP-1001", name: "Gara Nandini", role: "hr" },
    previousState: "Draft",
    newState: "Published",
    comments: "Published Q3 Townhall announcement",
    timestamp: new Date()
  }
];

let mockTna = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8001",
    tnaId: "TNA-1001",
    employee: { id: "EMP-1002", name: "Akhil Sirivella", dept: "Human Resources", designation: "HR Manager" },
    skillGapCategory: "Technical & Cloud",
    requestedSkill: "AWS Solutions Architecture & Kubernetes Ops",
    currentProficiency: 2,
    targetProficiency: 4,
    priority: "High",
    targetQuarter: "Q3-2026",
    justification: "Critical for enterprise cloud infrastructure migration.",
    status: "HR Approved",
    managerComments: "Approved. Essential for Q3 DevOps roadmap.",
    hrComments: "Budget allocated under Corporate Learning Fund."
  }
];

let mockAnnualPlans = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8010",
    planId: "ATP-2026",
    year: 2026,
    title: "FY2026 Enterprise Capability & Digital Transformation Plan",
    allocatedBudget: 750000,
    utilizedBudget: 280000,
    targetDepartments: ["Engineering", "Product", "Human Resources", "Finance"],
    plannedCoursesCount: 8,
    status: "In Execution",
    approvedBy: "Board of Directors"
  }
];

let mockTrainingPrograms = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8020",
    programId: "TRN-1001",
    title: "Microservices Architecture & High Performance Node.js",
    category: "Technical & Engineering",
    mode: "Classroom",
    durationHours: 16,
    trainer: { id: "TRN-VAL-01", name: "Dr. Rajesh Kumar (External SME)", type: "External" },
    venue: { name: "Auditorium Hall A", location: "HQ Bangalore", link: "" },
    capacity: 30,
    enrolledEmployees: [
      { id: "EMP-1002", name: "Akhil Sirivella", dept: "Human Resources", status: "Confirmed" },
      { id: "EMP-1003", name: "Karthik Potur", dept: "Engineering", status: "Completed" }
    ],
    scheduleDate: new Date(Date.now() + 5 * 86400000),
    status: "Scheduled"
  }
];

let mockTrainerVenues = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8030",
    type: "Trainer",
    name: "Dr. Rajesh Kumar",
    category: "External Cloud SME",
    location: "Bangalore",
    contactEmail: "rajesh.kumar@cloudexpert.io",
    rating: 4.9,
    specialization: "Distributed Systems & Kubernetes",
    isActive: true
  },
  {
    _id: "60c72b2f9b1d8b2a3c9f8031",
    type: "Venue",
    name: "Auditorium Hall A",
    category: "Executive Training Facility",
    location: "HQ Bangalore - Floor 4",
    capacity: 50,
    rating: 4.8,
    specialization: "A/V Equipment, 4K Projection & Hybrid Streaming",
    isActive: true
  }
];

let mockSkillMatrix = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8040",
    skillId: "SKL-1001",
    skillName: "Distributed Systems Architecture",
    category: "Core Technical",
    department: "Engineering",
    employee: { id: "EMP-1003", name: "Karthik Potur", designation: "Staff Engineer" },
    requiredLevel: 5,
    currentLevel: 4,
    gapScore: 1,
    lastEvaluatedAt: new Date(),
    evaluatorName: "VP of Engineering"
  }
];

let mockCompetencyMatrix = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8050",
    competencyId: "CMP-1001",
    competencyName: "Architectural Decision Making & Governance",
    frameworkType: "Functional Excellence",
    targetRole: "Senior Software Engineer / Tech Lead",
    targetGrade: "L5",
    benchmarkScore: 4.5,
    assessmentMethod: "Peer Architecture Review + Hands-on Exam",
    description: "Evaluates ability to design resilient, fault-tolerant enterprise software."
  }
];

let mockAssessments = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8060",
    assessmentId: "ASM-1001",
    title: "Microservices Security & Performance Certification Exam",
    programId: "TRN-1001",
    totalQuestions: 20,
    passingMarks: 75,
    certificateName: "Certified Enterprise Microservices Specialist",
    issuedCertificates: [
      { employeeId: "EMP-1003", employeeName: "Karthik Potur", score: 92, issueDate: new Date(), certificateUrl: "https://hrorbit.cert.verify/ASM-1001/EMP-1003" }
    ]
  }
];

let mockLearningHistory = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8070",
    employeeId: "EMP-1003",
    employeeName: "Karthik Potur",
    programId: "TRN-1001",
    programTitle: "Microservices Architecture & High Performance Node.js",
    category: "Technical",
    completionDate: new Date(),
    scoreObtained: 92,
    status: "Passed with Distinction",
    certificateUrl: "https://hrorbit.cert.verify/ASM-1001/EMP-1003"
  }
];

let mockTrainingAuditLogs = [
  {
    _id: "60c72b2f9b1d8b2a3c9f8080",
    moduleName: "Training & Competency Evaluation",
    entityType: "Program",
    entityId: "TRN-1001",
    action: "Scheduled",
    performedBy: { id: "EMP-1001", name: "Gara Nandini", role: "hr" },
    previousState: "Draft",
    newState: "Scheduled",
    comments: "Scheduled Microservices Architecture workshop",
    timestamp: new Date()
  }
];

function getMockList(modelName) {


  switch (modelName) {
    case 'Employee': return mockEmployees;
    case 'Leave': return mockLeaves;
    case 'Task': return mockTasks;
    case 'Ticket': return mockTickets;
    case 'Meeting': return mockMeetings;
    case 'Training': return mockTrainings;
    case 'Timesheet': return mockTimesheets;
    case 'VaultDocument': return mockVaultDocs;
    case 'ChatMessage': return mockChats;
    case 'Notification': return mockNotifications;
    case 'DiscussionMessage': return mockDiscussions;
    case 'WarningLetter': return mockWarnings;
    case 'CompanyMaster': return mockCompany;
    case 'BranchMaster': return mockBranches;
    case 'BusinessUnitMaster': return mockBUs;
    case 'CostCenterMaster': return mockCCs;
    case 'GradeBandMaster': return mockGradeBands;
    case 'DesignationMaster': return mockDesignations;
    case 'Department': return mockDepts;
    case 'SubDepartmentMaster': return mockSubDepts;
    case 'FloorMaster': return mockFloors;
    case 'BuildingMaster': return mockBuildings;
    case 'RegionMaster': return mockRegions;
    case 'TeamMaster': return mockTeams;
    case 'PositionMaster': return mockPositions;
    case 'OrgPolicy': return mockPolicies;
    case 'OrgDocument': return mockOrgDocs;
    case 'SuccessionPlan': return mockSuccessionPlans;
    case 'HeadcountPlan': return mockHeadcountPlans;
    case 'OrgAuditLog': return mockAuditLogs;
    case 'Candidate': return mockCandidates;
    case 'ManpowerRequisition': return mockManpowerRequisitions;
    case 'PositionApprovalRequest': return mockPositions;
    case 'VacancyBudgetRequest': return mockVacancyBudgetRequests;
    case 'ResumeAnalysis': return mockResumeAnalyses;
    case 'TalentPool': return mockTalentPool;
    case 'RecruitmentCost': return mockRecruitmentCosts;
    case 'RecruitmentAuditLog': return mockRecruitmentAuditLogs;
    case 'RecruitmentMaster': return mockRecruitmentMasters;
    case 'AppraisalCycleMaster': return mockAppraisalCycles;
    case 'RatingScaleMaster': return mockRatingScales;
    case 'CompetencyMaster': return mockCompetencies;
    case 'PerformanceTemplate': return mockPerformanceTemplates;
    case 'KraMaster': return mockKras;
    case 'KpiMaster': return mockKpis;
    case 'EmployeeGoal': return mockEmployeeGoals;
    case 'MidYearReview': return mockMidYearReviews;
    case 'AnnualReview': return mockAnnualReviews;
    case 'PipRecord': return mockPipRecords;
    case 'PerformanceAuditLog': return mockPerformanceAuditLogs;
    case 'PromotionRequest': return mockPromotions;
    case 'SalaryRevisionRequest': return mockIncrements;
    case 'OrgAuditLog': return mockAuditLogs;
    case 'Candidate': return mockCandidates;
    case 'ManpowerRequisition': return mockManpowerRequisitions;
    case 'PositionApprovalRequest': return mockRecruitmentPositions;
    case 'VacancyBudgetRequest': return mockVacancyBudgetRequests;
    case 'ResumeAnalysis': return mockResumeAnalyses;
    case 'TalentPool': return mockTalentPool;
    case 'RecruitmentCost': return mockRecruitmentCosts;
    case 'RecruitmentAuditLog': return mockRecruitmentAuditLogs;
    case 'RecruitmentMaster': return mockRecruitmentMasters;
    case 'Suggestion': return mockSuggestions;
    case 'Grievance': return mockGrievances;
    case 'HelpdeskTicket': return mockHelpdeskTickets;
    case 'WelfareRequest': return mockWelfareRequests;
    case 'RecognitionPost': return mockRecognitionPosts;
    case 'Communication': return mockCommunications;
    case 'CommunicationReadLog': return mockCommunicationReadLogs;
    case 'EngagementCategoryMaster': return mockEngagementCategories;
    case 'EngagementAuditLog': return mockEngagementAuditLogs;
    case 'TrainingNeedsAnalysis': return mockTna;
    case 'AnnualTrainingPlan': return mockAnnualPlans;
    case 'TrainingProgram': return mockTrainingPrograms;
    case 'TrainerVenue': return mockTrainerVenues;
    case 'SkillMatrix': return mockSkillMatrix;
    case 'CompetencyMatrix': return mockCompetencyMatrix;
    case 'AssessmentCertification': return mockAssessments;
    case 'LearningHistory': return mockLearningHistory;
    case 'TrainingAuditLog': return mockTrainingAuditLogs;
    default: return null;
  }
}



function getMockDataForModel(modelName, op, conditions) {
  let list = getMockList(modelName);
  if (!list) return op === 'countDocuments' || op === 'count' ? 0 : [];

  // Filter based on conditions
  if (conditions && typeof conditions === 'object') {
    list = list.filter(item => {
      for (let key in conditions) {
        let val = conditions[key];
        
        // Map database keys if they differ
        let itemKey = key;
        if (key === 'empId' && item.employeeId && !item.empId) {
          itemKey = 'employeeId';
        }
        
        let itemVal = item[itemKey];

        // Handle Mongoose query operators or exact matching
        if (val && typeof val === 'object') {
          if ('$nin' in val) {
            if (val.$nin.includes(itemVal)) return false;
          }
          if ('$in' in val) {
            if (!val.$in.includes(itemVal)) return false;
          }
        } else if (val !== undefined) {
          // Stringify both to match object IDs with strings
          const strItemVal = itemVal !== null && itemVal !== undefined ? itemVal.toString() : '';
          const strVal = val !== null && val !== undefined ? val.toString() : '';
          if (strItemVal !== strVal) return false;
        }
      }
      return true;
    });
  }

  // Handle operations
  if (op === 'countDocuments' || op === 'count') {
    return list.length;
  }
  
  if (op === 'findOne' || op === 'findById') {
    return list[0] || null;
  }

  return list;
}

function addMockDocument(modelName, doc) {
  let list = getMockList(modelName);
  if (!list) return;

  // Assign _id if missing
  if (!doc._id) {
    const hex = '0123456789abcdef';
    let mockId = '';
    for (let i = 0; i < 24; i++) {
      mockId += hex[Math.floor(Math.random() * 16)];
    }
    doc._id = mockId;
  }

  // Check if it already exists to avoid duplicates (e.g. updating an existing document)
  const existingIndex = list.findIndex(item => item._id && doc._id && item._id.toString() === doc._id.toString());
  if (existingIndex !== -1) {
    list[existingIndex] = { ...list[existingIndex], ...doc };
  } else {
    list.push(doc);
  }
  console.log(`[Offline Mode] Added document to ${modelName}. Total: ${list.length}`);
}

function getMockState() {
  return {
    mockTimesheets,
    mockLeaves,
    mockTasks,
    mockTickets,
    mockVaultDocs,
    mockChats
  };
}

function setMockState(state) {
  if (!state) return;
  if (state.mockTimesheets) mockTimesheets = state.mockTimesheets;
  if (state.mockLeaves) mockLeaves = state.mockLeaves;
  if (state.mockTasks) mockTasks = state.mockTasks;
  if (state.mockTickets) mockTickets = state.mockTickets;
  if (state.mockVaultDocs) mockVaultDocs = state.mockVaultDocs;
  if (state.mockChats) mockChats = state.mockChats;
}

module.exports = {
  getMockDataForModel,
  addMockDocument,
  getMockState,
  setMockState
};
