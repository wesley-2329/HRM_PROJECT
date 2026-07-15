let mockEmployees = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7890",
    id: "EMP-0001",
    name: "Venkat Raman",
    role: "hr",
    dept: "Human Resources",
    joined: "2018-05-10",
    email: "hr@company.com",
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
    _id: "60c72b2f9b1d8b2a3c9d7891",
    id: "EMP-0002",
    name: "Aditya Kumar",
    role: "employee",
    dept: "Engineering",
    joined: "2021-06-15",
    email: "employee@company.com",
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
    teamLeadId: "EMP-0001",
    isTeamLead: true
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d7892",
    id: "EMP-0003",
    name: "Priya Nair",
    role: "employee",
    dept: "Engineering",
    joined: "2022-03-01",
    email: "priya@company.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    aadhaar: "1111-2222-3333",
    phone: "+91 98765 00003",
    blood: "B+",
    dob: "1998-05-12",
    gender: "Female",
    designation: "Software Engineer",
    branch: "HQ Bangalore",
    businessUnit: "Cloud Solutions",
    costCenter: "Engineering CC",
    teamLeadId: "EMP-0002"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d7893",
    id: "EMP-0004",
    name: "Vikram Malhotra",
    role: "employee",
    dept: "Engineering",
    joined: "2020-11-15",
    email: "vikram@company.com",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    aadhaar: "2222-3333-4444",
    phone: "+91 98765 00004",
    blood: "AB+",
    dob: "1992-09-25",
    gender: "Male",
    designation: "DevOps Engineer",
    branch: "HQ Bangalore",
    businessUnit: "Cloud Solutions",
    costCenter: "Engineering CC",
    teamLeadId: "EMP-0002"
  }
];

let mockLeaves = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7901",
    employeeId: "EMP-0002",
    empId: "EMP-0002",
    employeeName: "Aditya Kumar",
    leaveType: "Sick Leave",
    startDate: "2026-07-10",
    endDate: "2026-07-11",
    reason: "Fever and flu",
    status: "Approved"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d7902",
    employeeId: "EMP-0003",
    empId: "EMP-0003",
    employeeName: "Priya Nair",
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
    assignedTo: "EMP-0002",
    assignedToName: "Aditya Kumar",
    dueDate: "2026-07-15",
    priority: "High",
    status: "Completed"
  },
  {
    _id: "60c72b2f9b1d8b2a3c9d7912",
    title: "Implement Leave Balance Tracker",
    description: "Add leave balance updates inside client-side components.",
    assignedTo: "EMP-0003",
    assignedToName: "Priya Nair",
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
    employeeId: "EMP-0002",
    empId: "EMP-0002",
    employeeName: "Aditya Kumar",
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
    participants: ["EMP-0001", "EMP-0002", "EMP-0003"],
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
    empId: "EMP-0002",
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
    uploadedBy: "EMP-0002",
    uploadedByName: "Aditya Kumar",
    status: "Approved",
    currentVersion: 1,
    versions: [{ version: 1, path: "/tmp/uploads/emp2_aadhaar.pdf", date: "2026-07-14" }]
  }
];

let mockChats = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7971",
    senderId: "EMP-0001",
    senderName: "Venkat Raman",
    message: "Hi Team, please ensure your checklists are updated.",
    timestamp: "2026-07-14T10:30:00.000Z"
  }
];

let mockNotifications = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7981",
    userId: "EMP-0002",
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
    authorId: "EMP-0001",
    authorName: "Venkat Raman",
    createdAt: "2026-07-14T11:00:00.000Z",
    replies: []
  }
];

let mockWarnings = [];

let mockCompany = [
  { _id: "60c72b2f9b1d8b2a3c9d7a01", name: "HR O Technologies", code: "HO-001", businessType: "Information Technology", status: "Active" }
];

let mockBranches = [
  { _id: "60c72b2f9b1d8b2a3c9d7a11", name: "HQ Bangalore", code: "BLR-01", location: "Bangalore, KA", branchHead: "Venkat Raman", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a12", name: "Tech Park Pune", code: "PUN-02", location: "Pune, MH", branchHead: "Priya Nair", status: "Active" }
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
  { _id: "60c72b2f9b1d8b2a3c9d7a61", name: "Engineering", code: "DEPT-ENG", description: "Software development and engineering", parentDept: "", managerId: "EMP-0002", businessUnit: "Cloud Solutions", location: "HQ Bangalore", costCenter: "Engineering CC", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a62", name: "Human Resources", code: "DEPT-HR", description: "People Ops and Payroll", parentDept: "", managerId: "EMP-0001", businessUnit: "Enterprise Apps", location: "HQ Bangalore", costCenter: "HR Operations CC", status: "Active" }
];

let mockSubDepts = [
  { _id: "60c72b2f9b1d8b2a3c9d7a71", name: "Frontend Engineering", code: "SUB-FE", parentDept: "Engineering", managerId: "EMP-0002", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a72", name: "Backend Engineering", code: "SUB-BE", parentDept: "Engineering", managerId: "EMP-0002", status: "Active" }
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
let mockCandidates = [];

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
    doc._id = 'mock_' + Math.random().toString(36).substr(2, 9);
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

module.exports = {
  getMockDataForModel,
  addMockDocument
};
