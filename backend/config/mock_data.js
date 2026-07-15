const mockEmployees = [
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

const mockLeaves = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7901",
    employeeId: "EMP-0002",
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
    employeeName: "Priya Nair",
    leaveType: "Casual Leave",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    reason: "Family gathering",
    status: "Pending"
  }
];

const mockTasks = [
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

const mockTickets = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7921",
    ticketId: "TCK-1001",
    title: "VPN Access Rejected",
    description: "Unable to connect to Pune staging router. IP selection throws authentication handshake error.",
    category: "IT Support",
    priority: "High",
    status: "Open",
    employeeId: "EMP-0002",
    employeeName: "Aditya Kumar",
    createdAt: "2026-07-14T10:00:00.000Z"
  }
];

const mockMeetings = [
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

const mockTrainings = [
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

const mockTimesheets = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7951",
    employeeId: "EMP-0002",
    employeeName: "Aditya Kumar",
    date: "2026-07-14",
    clockIn: "09:05 AM",
    clockOut: "06:15 PM",
    duration: "9h 10m"
  }
];

const mockVaultDocs = [
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

const mockChats = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7971",
    senderId: "EMP-0001",
    senderName: "Venkat Raman",
    message: "Hi Team, please ensure your checklists are updated.",
    timestamp: "2026-07-14T10:30:00.000Z"
  }
];

const mockNotifications = [
  {
    _id: "60c72b2f9b1d8b2a3c9d7981",
    userId: "EMP-0002",
    title: "Task Assigned",
    message: "You have been assigned: Configure Vercel Routing",
    read: false,
    createdAt: "2026-07-14T09:12:00.000Z"
  }
];

const mockDiscussions = [
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

const mockWarnings = [];

const mockCompany = [
  { _id: "60c72b2f9b1d8b2a3c9d7a01", name: "HR O Technologies", code: "HO-001", businessType: "Information Technology", status: "Active" }
];

const mockBranches = [
  { _id: "60c72b2f9b1d8b2a3c9d7a11", name: "HQ Bangalore", code: "BLR-01", location: "Bangalore, KA", branchHead: "Venkat Raman", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a12", name: "Tech Park Pune", code: "PUN-02", location: "Pune, MH", branchHead: "Priya Nair", status: "Active" }
];

const mockBUs = [
  { _id: "60c72b2f9b1d8b2a3c9d7a21", name: "Cloud Solutions", code: "BU-CS", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a22", name: "Enterprise Apps", code: "BU-EA", status: "Active" }
];

const mockCCs = [
  { _id: "60c72b2f9b1d8b2a3c9d7a31", name: "Engineering CC", code: "CC-ENG", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a32", name: "HR Operations CC", code: "CC-HR", status: "Active" }
];

const mockGradeBands = [
  { _id: "60c72b2f9b1d8b2a3c9d7a41", name: "L1", description: "Entry-level Analyst/Engineer", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a42", name: "L2", description: "Senior Consultant/Engineer", status: "Active" }
];

const mockDesignations = [
  { _id: "60c72b2f9b1d8b2a3c9d7a51", name: "Software Engineer", code: "SE", deptMapping: "Engineering", gradeMapping: "L1", positionLimit: 50, status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a52", name: "Senior Software Engineer", code: "SSE", deptMapping: "Engineering", gradeMapping: "L2", positionLimit: 30, status: "Active" }
];

const mockDepts = [
  { _id: "60c72b2f9b1d8b2a3c9d7a61", name: "Engineering", code: "DEPT-ENG", description: "Software development and engineering", parentDept: "", managerId: "EMP-0002", businessUnit: "Cloud Solutions", location: "HQ Bangalore", costCenter: "Engineering CC", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a62", name: "Human Resources", code: "DEPT-HR", description: "People Ops and Payroll", parentDept: "", managerId: "EMP-0001", businessUnit: "Enterprise Apps", location: "HQ Bangalore", costCenter: "HR Operations CC", status: "Active" }
];

const mockSubDepts = [
  { _id: "60c72b2f9b1d8b2a3c9d7a71", name: "Frontend Engineering", code: "SUB-FE", parentDept: "Engineering", managerId: "EMP-0002", status: "Active" },
  { _id: "60c72b2f9b1d8b2a3c9d7a72", name: "Backend Engineering", code: "SUB-BE", parentDept: "Engineering", managerId: "EMP-0002", status: "Active" }
];

const mockFloors = [
  { _id: "60c72b2f9b1d8b2a3c9d7a81", name: "4th Floor", code: "FLR-04", building: "Building A", status: "Active" }
];

const mockBuildings = [
  { _id: "60c72b2f9b1d8b2a3c9d7a91", name: "Building A", code: "BLDG-A", status: "Active" }
];

const mockRegions = [
  { _id: "60c72b2f9b1d8b2a3c9d7aa1", name: "India East", code: "REG-IE", status: "Active" }
];

const mockTeams = [
  { _id: "60c72b2f9b1d8b2a3c9d7ab1", name: "Core Developers", code: "TM-DEV", status: "Active" }
];

const mockPositions = [
  { _id: "60c72b2f9b1d8b2a3c9d7ac1", name: "Fullstack Engineer", code: "POS-FE", status: "Active" }
];

const mockPolicies = [
  { _id: "60c72b2f9b1d8b2a3c9d7ad1", title: "Information Security Policy", content: "Guidelines on data handling and system security.", status: "Active" }
];

const mockOrgDocs = [];
const mockSuccessionPlans = [];
const mockHeadcountPlans = [];
const mockAuditLogs = [];
const mockCandidates = [];

function getMockDataForModel(modelName, op, conditions) {
  let list = [];
  switch (modelName) {
    case 'Employee':
      list = mockEmployees;
      break;
    case 'Leave':
      list = mockLeaves;
      break;
    case 'Task':
      list = mockTasks;
      break;
    case 'Ticket':
      list = mockTickets;
      break;
    case 'Meeting':
      list = mockMeetings;
      break;
    case 'Training':
      list = mockTrainings;
      break;
    case 'Timesheet':
      list = mockTimesheets;
      break;
    case 'VaultDocument':
      list = mockVaultDocs;
      break;
    case 'ChatMessage':
      list = mockChats;
      break;
    case 'Notification':
      list = mockNotifications;
      break;
    case 'DiscussionMessage':
      list = mockDiscussions;
      break;
    case 'WarningLetter':
      list = mockWarnings;
      break;
    case 'CompanyMaster':
      list = mockCompany;
      break;
    case 'BranchMaster':
      list = mockBranches;
      break;
    case 'BusinessUnitMaster':
      list = mockBUs;
      break;
    case 'CostCenterMaster':
      list = mockCCs;
      break;
    case 'GradeBandMaster':
      list = mockGradeBands;
      break;
    case 'DesignationMaster':
      list = mockDesignations;
      break;
    case 'Department':
      list = mockDepts;
      break;
    case 'SubDepartmentMaster':
      list = mockSubDepts;
      break;
    case 'FloorMaster':
      list = mockFloors;
      break;
    case 'BuildingMaster':
      list = mockBuildings;
      break;
    case 'RegionMaster':
      list = mockRegions;
      break;
    case 'TeamMaster':
      list = mockTeams;
      break;
    case 'PositionMaster':
      list = mockPositions;
      break;
    case 'OrgPolicy':
      list = mockPolicies;
      break;
    case 'OrgDocument':
      list = mockOrgDocs;
      break;
    case 'SuccessionPlan':
      list = mockSuccessionPlans;
      break;
    case 'HeadcountPlan':
      list = mockHeadcountPlans;
      break;
    case 'OrgAuditLog':
      list = mockAuditLogs;
      break;
    case 'Candidate':
      list = mockCandidates;
      break;
    default:
      list = [];
  }

  // Handle operations
  if (op === 'countDocuments' || op === 'count') {
    return list.length;
  }
  
  if (op === 'findOne' || op === 'findById') {
    // Attempt query filters matching
    if (conditions && conditions._id) {
      const match = list.find(item => item._id.toString() === conditions._id.toString());
      if (match) return match;
    }
    if (conditions && conditions.email) {
      const match = list.find(item => item.email === conditions.email);
      if (match) return match;
    }
    if (conditions && conditions.id) {
      const match = list.find(item => item.id === conditions.id);
      if (match) return match;
    }
    return list[0] || null;
  }

  // Return list for find operations
  return list;
}

module.exports = {
  getMockDataForModel
};
