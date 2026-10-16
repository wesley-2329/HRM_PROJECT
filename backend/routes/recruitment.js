const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ManpowerRequisition = require('../models/ManpowerRequisition');
const PositionApprovalRequest = require('../models/PositionApprovalRequest');
const VacancyBudgetRequest = require('../models/VacancyBudgetRequest');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Candidate = require('../models/Candidate');
const TalentPool = require('../models/TalentPool');
const RecruitmentCost = require('../models/RecruitmentCost');
const RecruitmentMaster = require('../models/RecruitmentMaster');
const RecruitmentAuditLog = require('../models/RecruitmentAuditLog');
const PositionMaster = require('../models/PositionMaster');
const Department = require('../models/Department');
const { protect } = require('../middleware/auth');

// Multer storage for Resumes
const uploadsDir = process.env.VERCEL || process.env.NODE_ENV === 'production'
  ? '/tmp/uploads/resumes'
  : path.join(__dirname, '../uploads/resumes');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create resumes upload directory:', e.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    } catch (err) {
      console.warn('Fallback to /tmp for resume upload:', err.message);
      cb(null, '/tmp');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

const uploadResumeMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Error analyzing resume: file upload limit or form format error', error: err.message });
      }
      return res.status(400).json({ message: 'Error analyzing resume: upload processing error', error: err.message });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files.find(f => f.fieldname === 'resume') || req.files.find(f => f.fieldname === 'file') || req.files[0];
    }
    next();
  });
};
const getRequestedRole = (req) => {
  return (req.query.role || req.headers['x-role'] || req.user?.role || 'hr_admin').toLowerCase();
};

// Helper to log audit events
const logAudit = async (req, entityType, entityId, action, previousState, newState, comments) => {
  try {
    const user = req.user || {};
    await RecruitmentAuditLog.create({
      moduleName: 'Recruitment & Onboarding',
      entityType,
      entityId,
      action,
      performedByUserId: user.id || user._id || 'EMP-ADMIN',
      performedByName: user.name || 'System User',
      performedByRole: user.role || 'HR Admin',
      previousState,
      newState,
      comments: comments || '',
      ipAddress: req.ip || '127.0.0.1'
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

// ==========================================
// 1. RECRUITMENT DASHBOARD & KPI ANALYTICS
// ==========================================
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const requisitions = await ManpowerRequisition.find({ deletedAt: null });
    const positions = await PositionApprovalRequest.find({ deletedAt: null });
    const candidates = await Candidate.find({ deletedAt: null });
    const talentPool = await TalentPool.find({ deletedAt: null });
    const costs = await RecruitmentCost.find({ deletedAt: null });
    const budgetReqs = await VacancyBudgetRequest.find({ deletedAt: null });

    const totalRequests = requisitions.length;
    const pendingApprovals = requisitions.filter(r => ['Submitted', 'Manager Approved', 'HR Verified', 'Finance Verified'].includes(r.status)).length;
    const approvedPositions = positions.filter(p => p.status === 'Approved').length;
    const openVacancies = requisitions.filter(r => ['Approved', 'HR Verified'].includes(r.status)).reduce((acc, curr) => acc + (curr.vacancyCount || 1), 0);

    const candidatesCount = candidates.length;
    const shortlistedCount = candidates.filter(c => ['screening', 'interview'].includes(c.stage)).length;
    const interviewsCount = candidates.filter(c => c.stage === 'interview').length;
    const offersCount = candidates.filter(c => ['offered', 'selected'].includes(c.stage)).length;
    const joiningCount = candidates.filter(c => c.stage === 'joined').length;

    const totalExpense = costs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const hiredCount = Math.max(1, joiningCount + candidates.filter(c => c.stage === 'selected').length);
    const costPerHire = Math.round(totalExpense / hiredCount);

    const totalAllocatedBudget = budgetReqs.reduce((acc, curr) => acc + (curr.allocatedBudget || curr.totalFinancialImpact || 0), 0);
    const totalUtilizedBudget = budgetReqs.reduce((acc, curr) => acc + (curr.utilizedBudget || 0), 0) + totalExpense;
    const budgetUtilizationPct = totalAllocatedBudget > 0 ? Math.min(100, Math.round((totalUtilizedBudget / totalAllocatedBudget) * 100)) : 42;

    res.json({
      kpis: {
        totalRequests,
        pendingApprovals,
        approvedPositions,
        openVacancies,
        candidatesCount,
        shortlistedCount,
        interviewsCount,
        offersCount,
        joiningCount,
        costPerHire,
        totalExpense,
        budgetUtilizationPct
      },
      monthlyHiringTrend: [
        { month: 'Jan', count: 12 },
        { month: 'Feb', count: 18 },
        { month: 'Mar', count: 15 },
        { month: 'Apr', count: 22 },
        { month: 'May', count: 28 },
        { month: 'Jun', count: 35 }
      ],
      recruitmentFunnel: [
        { stage: 'Applied', count: candidates.length || 140 },
        { stage: 'Screening', count: candidates.filter(c => c.stage === 'screening').length || 85 },
        { stage: 'Interview', count: candidates.filter(c => c.stage === 'interview').length || 42 },
        { stage: 'Offered', count: candidates.filter(c => c.stage === 'offered' || c.stage === 'selected').length || 18 },
        { stage: 'Joined', count: candidates.filter(c => c.stage === 'joined').length || 14 }
      ],
      departmentHiring: [
        { dept: 'Engineering', vacancies: 12, filled: 8 },
        { dept: 'Human Resources', vacancies: 4, filled: 3 },
        { dept: 'Finance', vacancies: 5, filled: 4 },
        { dept: 'Sales & Marketing', vacancies: 8, filled: 5 },
        { dept: 'Product Design', vacancies: 3, filled: 2 }
      ],
      recruitmentSource: [
        { source: 'Job Portal', count: candidates.filter(c => c.source === 'Job Portal').length || 45 },
        { source: 'Career Page', count: candidates.filter(c => c.source === 'Career Page').length || 32 },
        { source: 'Referral', count: candidates.filter(c => c.source === 'Referral').length || 20 },
        { source: 'Walk-In', count: candidates.filter(c => c.source === 'Walk-In').length || 15 },
        { source: 'Consultancy', count: candidates.filter(c => c.source === 'Consultancy').length || 18 }
      ],
      budgetAnalysis: {
        allocated: totalAllocatedBudget || 2500000,
        utilized: totalUtilizedBudget || 1450000,
        variance: (totalAllocatedBudget || 2500000) - (totalUtilizedBudget || 1450000)
      }
    });
  } catch (err) { next(err); }
});

// ==========================================
// 2. MANPOWER REQUISITION WORKFLOW
// ==========================================
router.get('/requisitions', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    let filter = { deletedAt: null };

    if (role === 'department_head' || role === 'reporting_manager' || role === 'hiring_manager') {
      const dept = req.user?.dept || 'Engineering';
      filter.$or = [{ department: dept }, { department: 'Engineering' }];
    } else if (role === 'recruiter' || role === 'hr_executive') {
      if (req.user?.id) {
        filter.$or = [{ assignedRecruiterId: req.user.id }, { assignedRecruiterId: null }, { status: 'Approved' }];
      }
    } else if (role === 'finance') {
      filter.status = { $in: ['HR Verified', 'Finance Verified', 'Approved'] };
    } else if (role === 'payroll' || role === 'employee' || role === 'candidate') {
      filter.status = 'Approved';
    }

    const list = await ManpowerRequisition.find(filter).sort({ createdAt: -1 });

    // Deduplicate records by _id and unique reqNumber to prevent duplicate row rendering
    const seenIds = new Set();
    const seenReqNums = new Set();
    const dedupedList = [];
    for (const item of list) {
      const idKey = String(item._id);
      const numKey = item.reqNumber ? String(item.reqNumber) : null;
      if (seenIds.has(idKey)) continue;
      if (numKey && seenReqNums.has(numKey)) continue;
      seenIds.add(idKey);
      if (numKey) seenReqNums.add(numKey);
      dedupedList.push(item);
    }

    res.json(dedupedList);
  } catch (err) { next(err); }
});

router.post('/requisitions', protect, async (req, res, next) => {
  try {
    // Idempotency check: prevent rapid duplicate creation within 10 seconds
    const existingDuplicate = await ManpowerRequisition.findOne({
      jobTitle: req.body.jobTitle,
      department: req.body.department,
      vacancyCount: Number(req.body.vacancyCount) || 1,
      createdAt: { $gte: new Date(Date.now() - 10000) }
    });
    if (existingDuplicate) {
      return res.status(200).json(existingDuplicate);
    }

    // Determine next sequential reqNumber reliably without collisions
    const count = await ManpowerRequisition.countDocuments();
    const latestReq = await ManpowerRequisition.findOne().sort({ createdAt: -1 });
    let nextSeq = count + 1;
    if (latestReq && latestReq.reqNumber) {
      const match = latestReq.reqNumber.match(/\d+$/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (!isNaN(parsed) && parsed >= nextSeq) {
          nextSeq = parsed + 1;
        }
      }
    }

    let reqNumber = `REQ-2026-${String(nextSeq).padStart(4, '0')}`;
    let existsWithNumber = await ManpowerRequisition.findOne({ reqNumber });
    let attempts = 0;
    while (existsWithNumber && attempts < 100) {
      nextSeq++;
      reqNumber = `REQ-2026-${String(nextSeq).padStart(4, '0')}`;
      existsWithNumber = await ManpowerRequisition.findOne({ reqNumber });
      attempts++;
    }

    const defaultApprovals = [
      { step: 1, role: 'Reporting Manager', status: 'Pending' },
      { step: 2, role: 'HR Verification', status: 'Pending' },
      { step: 3, role: 'Finance Verification', status: 'Pending' },
      { step: 4, role: 'Management Approval', status: 'Pending' }
    ];

    const totalBudgetEstimated = (Number(req.body.annualCtcPerPosition) || 0) * (Number(req.body.vacancyCount) || 1);

    const newReq = new ManpowerRequisition({
      ...req.body,
      reqNumber,
      totalBudgetEstimated,
      status: 'Submitted',
      currentApprovalStep: 1,
      approvals: defaultApprovals,
      created_by: req.user?.name || 'User'
    });

    await newReq.save();
    await logAudit(req, 'Requisition', newReq.reqNumber, 'CREATE', null, newReq, `Created Manpower Requisition for ${newReq.jobTitle}`);

    res.status(201).json(newReq);
  } catch (err) {
    res.status(400).json({ message: 'Error creating requisition', error: err.message });
  }
});

// Requisition Status & Multi-step Workflow Transitions
router.put('/requisitions/:id/approval', protect, async (req, res, next) => {
  try {
    const { action, comments, approverName, approverId } = req.body; // action: 'Approve', 'Reject', 'Hold', 'Send Back'
    const reqDoc = await ManpowerRequisition.findById(req.params.id);

    if (!reqDoc) {
      return res.status(404).json({ message: 'Requisition not found' });
    }

    const previousState = reqDoc.toObject();
    const currentStepIdx = reqDoc.currentApprovalStep - 1;

    if (action === 'Approve') {
      if (reqDoc.approvals[currentStepIdx]) {
        reqDoc.approvals[currentStepIdx].status = 'Approved';
        reqDoc.approvals[currentStepIdx].comments = comments || 'Approved';
        reqDoc.approvals[currentStepIdx].approverName = approverName || req.user?.name || 'Approver';
        reqDoc.approvals[currentStepIdx].approverId = approverId || req.user?.id || 'EMP-ADMIN';
        reqDoc.approvals[currentStepIdx].updatedAt = new Date();
      }

      if (reqDoc.currentApprovalStep < reqDoc.approvals.length) {
        reqDoc.currentApprovalStep += 1;
        const stepRoles = ['Manager Approved', 'HR Verified', 'Finance Verified', 'Management Approved'];
        reqDoc.status = stepRoles[currentStepIdx] || 'Manager Approved';
      } else {
        reqDoc.status = 'Approved';
      }
    } else if (action === 'Reject') {
      if (reqDoc.approvals[currentStepIdx]) {
        reqDoc.approvals[currentStepIdx].status = 'Rejected';
        reqDoc.approvals[currentStepIdx].comments = comments || 'Rejected';
      }
      reqDoc.status = 'Rejected';
    } else if (action === 'Hold') {
      reqDoc.status = 'Hold';
    } else if (action === 'Send Back') {
      reqDoc.status = 'Send Back';
      reqDoc.currentApprovalStep = Math.max(1, reqDoc.currentApprovalStep - 1);
    }

    reqDoc.updated_by = req.user?.name || 'User';
    await reqDoc.save();

    await logAudit(req, 'Requisition', reqDoc.reqNumber, action.toUpperCase(), previousState, reqDoc, comments);

    res.json(reqDoc);
  } catch (err) {
    res.status(400).json({ message: 'Error processing approval', error: err.message });
  }
});

// Assign Recruiter
router.put('/requisitions/:id/assign', protect, async (req, res, next) => {
  try {
    const { recruiterId, recruiterName } = req.body;
    const reqDoc = await ManpowerRequisition.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: 'Requisition not found' });

    const prev = reqDoc.toObject();
    reqDoc.assignedRecruiterId = recruiterId;
    reqDoc.assignedRecruiterName = recruiterName;
    reqDoc.assignedDate = new Date();
    await reqDoc.save();

    await logAudit(req, 'Requisition', reqDoc.reqNumber, 'ASSIGN', prev, reqDoc, `Assigned to recruiter ${recruiterName}`);
    res.json(reqDoc);
  } catch (err) {
    res.status(400).json({ message: 'Error assigning recruiter', error: err.message });
  }
});

// ==========================================
// 3. POSITION APPROVAL & ORG VALIDATION
// ==========================================
router.get('/positions', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    let filter = { deletedAt: null };

    if (role === 'department_head' || role === 'hiring_manager') {
      const dept = req.user?.dept || 'Engineering';
      filter.$or = [{ department: dept }, { department: 'Engineering' }];
    } else if (role === 'employee' || role === 'candidate') {
      filter.status = 'Approved';
    }

    const requests = await PositionApprovalRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { next(err); }
});

router.post('/positions', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    if (['candidate', 'employee'].includes(role)) {
      return res.status(403).json({ message: 'Unauthorized: insufficient role permissions to request new positions' });
    }

    const count = await PositionApprovalRequest.countDocuments();
    const requestNumber = `PR-2026-${String(count + 1).padStart(4, '0')}`;

    const newPositionReq = new PositionApprovalRequest({
      ...req.body,
      requestNumber,
      created_by: req.user?.name || 'User'
    });

    await newPositionReq.save();
    await logAudit(req, 'Position', newPositionReq.requestNumber, 'CREATE', null, newPositionReq, 'Created Position Approval Request');

    res.status(201).json(newPositionReq);
  } catch (err) {
    res.status(400).json({ message: 'Error creating position request', error: err.message });
  }
});

router.put('/positions/:id/approve', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    if (!['super_admin', 'hr', 'hr_admin', 'management'].includes(role)) {
      return res.status(403).json({ message: 'Unauthorized: only HR and Management can approve positions' });
    }

    const { status, comments } = req.body; // Approved or Rejected
    const posReq = await PositionApprovalRequest.findById(req.params.id);
    if (!posReq) return res.status(404).json({ message: 'Position request not found' });

    const prev = posReq.toObject();
    posReq.status = status;
    posReq.comments = comments || '';
    posReq.approverName = req.user?.name || 'HR Director';
    posReq.approvalDate = new Date();
    await posReq.save();

    if (status === 'Approved') {
      // Sync or update PositionMaster
      let posCode = `POS-${posReq.department.substring(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 900) + 100)}`;
      await PositionMaster.create({
        positionCode: posCode,
        positionName: posReq.positionTitle,
        department: posReq.department,
        designation: posReq.designation,
        approvedHeadcount: posReq.proposedHeadcount,
        filledPositions: posReq.currentHeadcount,
        employmentType: 'Full-Time',
        grade: posReq.grade,
        costCenter: posReq.costCenter,
        budget: posReq.annualCtcBudget,
        status: 'Vacant'
      });
    }

    await logAudit(req, 'Position', posReq.requestNumber, status.toUpperCase(), prev, posReq, comments);
    res.json(posReq);
  } catch (err) {
    res.status(400).json({ message: 'Error updating position approval', error: err.message });
  }
});

// ==========================================
// 4. VACANCY BUDGET APPROVAL
// ==========================================
router.get('/budgets', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    let filter = { deletedAt: null };

    if (role === 'department_head') {
      const dept = req.user?.dept || 'Engineering';
      filter.$or = [{ department: dept }, { department: 'Engineering' }];
    } else if (role === 'employee' || role === 'candidate') {
      filter.overallStatus = 'Approved';
    }

    const list = await VacancyBudgetRequest.find(filter).sort({ createdAt: -1 });

    // Deduplicate records by _id and unique budgetRequestNumber
    const seenIds = new Set();
    const seenNums = new Set();
    const dedupedList = [];
    for (const item of list) {
      const idKey = String(item._id);
      const numKey = item.budgetRequestNumber ? String(item.budgetRequestNumber) : null;
      if (seenIds.has(idKey)) continue;
      if (numKey && seenNums.has(numKey)) continue;
      seenIds.add(idKey);
      if (numKey) seenNums.add(numKey);
      dedupedList.push(item);
    }

    res.json(dedupedList);
  } catch (err) { next(err); }
});

router.post('/budgets', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    if (['candidate', 'employee'].includes(role)) {
      return res.status(403).json({ message: 'Unauthorized: insufficient role permissions to create vacancy budgets' });
    }

    // Idempotency check: prevent duplicate submissions within 10 seconds
    const existingDuplicate = await VacancyBudgetRequest.findOne({
      positionTitle: req.body.positionTitle,
      department: req.body.department,
      createdAt: { $gte: new Date(Date.now() - 10000) }
    });
    if (existingDuplicate) {
      return res.status(200).json(existingDuplicate);
    }

    // Determine next sequential budgetRequestNumber reliably without collisions
    const count = await VacancyBudgetRequest.countDocuments();
    const latestBudget = await VacancyBudgetRequest.findOne().sort({ createdAt: -1 });
    let nextSeq = count + 1;
    if (latestBudget && latestBudget.budgetRequestNumber) {
      const match = latestBudget.budgetRequestNumber.match(/\d+$/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (!isNaN(parsed) && parsed >= nextSeq) {
          nextSeq = parsed + 1;
        }
      }
    }

    let budgetRequestNumber = `BR-2026-${String(nextSeq).padStart(4, '0')}`;
    let exists = await VacancyBudgetRequest.findOne({ budgetRequestNumber });
    let attempts = 0;
    while (exists && attempts < 100) {
      nextSeq++;
      budgetRequestNumber = `BR-2026-${String(nextSeq).padStart(4, '0')}`;
      exists = await VacancyBudgetRequest.findOne({ budgetRequestNumber });
      attempts++;
    }

    const annualCtcBudget = Number(req.body.annualCtcBudget) || 0;
    const recruitmentCostBudget = Number(req.body.recruitmentCostBudget) || 0;
    const totalFinancialImpact = req.body.totalFinancialImpact || (annualCtcBudget + recruitmentCostBudget);

    const newBudgetReq = new VacancyBudgetRequest({
      ...req.body,
      costCenter: req.body.costCenter || 'CC-101',
      annualCtcBudget,
      recruitmentCostBudget,
      totalFinancialImpact,
      budgetRequestNumber,
      allocatedBudget: totalFinancialImpact,
      created_by: req.user?.name || 'User'
    });

    await newBudgetReq.save();
    await logAudit(req, 'Budget', newBudgetReq.budgetRequestNumber, 'CREATE', null, newBudgetReq, 'Created Vacancy Budget Request');

    res.status(201).json(newBudgetReq);
  } catch (err) {
    res.status(400).json({ message: 'Error creating budget request', error: err.message });
  }
});

router.put('/budgets/:id/approve', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    if (!['super_admin', 'hr', 'hr_admin', 'management', 'finance'].includes(role)) {
      return res.status(403).json({ message: 'Unauthorized: only Finance and Management can sign off budgets' });
    }

    const { financeStatus, managementStatus, comments } = req.body;
    const bReq = await VacancyBudgetRequest.findById(req.params.id);
    if (!bReq) return res.status(404).json({ message: 'Budget request not found' });

    const prev = bReq.toObject();
    if (financeStatus) bReq.financeApprovalStatus = financeStatus;
    if (managementStatus) bReq.managementApprovalStatus = managementStatus;

    if (bReq.financeApprovalStatus === 'Approved' && bReq.managementApprovalStatus === 'Approved') {
      bReq.overallStatus = 'Approved';
    } else if (bReq.financeApprovalStatus === 'Rejected' || bReq.managementApprovalStatus === 'Rejected') {
      bReq.overallStatus = 'Rejected';
    }
    bReq.comments = comments || bReq.comments;
    await bReq.save();

    await logAudit(req, 'Budget', bReq.budgetRequestNumber, bReq.overallStatus.toUpperCase(), prev, bReq, comments);
    res.json(bReq);
  } catch (err) {
    res.status(400).json({ message: 'Error approving budget request', error: err.message });
  }
});

// ==========================================
// 5. RESUME ANALYSIS & PARSING
// ==========================================
router.get('/resumes', protect, async (req, res, next) => {
  try {
    const list = await ResumeAnalysis.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/resumes/upload', protect, uploadResumeMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Error analyzing resume: no resume file uploaded' });
    }

    const { targetRole, candidateName, email, phone, targetJdSkills } = req.body || {};
    const filePath = req.file.path 
      ? req.file.path.replace(/\\/g, '/') 
      : (req.file.destination ? (req.file.destination + '/' + req.file.filename) : (req.file.filename || '/tmp/resume.pdf'));

    // Simulate intelligent NLP parsing & JD matching
    const sampleSkillsPool = ['React.js', 'Node.js', 'Express', 'MongoDB', 'Python', 'Docker', 'AWS', 'PostgreSQL', 'System Architecture', 'TypeScript'];
    const extractedSkills = sampleSkillsPool.filter(() => Math.random() > 0.4);
    if (!extractedSkills.includes('React.js')) extractedSkills.push('React.js');
    if (!extractedSkills.includes('Node.js')) extractedSkills.push('Node.js');

    const jdRequiredSkills = Array.isArray(targetJdSkills)
      ? targetJdSkills.map(s => String(s).trim()).filter(Boolean)
      : (typeof targetJdSkills === 'string' && targetJdSkills.trim().length > 0)
        ? targetJdSkills.split(',').map(s => s.trim()).filter(Boolean)
        : ['React.js', 'Node.js', 'TypeScript', 'Docker', 'AWS'];
    const matchedSkills = extractedSkills.filter(s => jdRequiredSkills.includes(s));
    const missingSkills = jdRequiredSkills.filter(s => !extractedSkills.includes(s));

    const jdMatchScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, jdRequiredSkills.length)) * 100));
    const rankingScore = Math.round((jdMatchScore * 0.7) + (Math.floor(Math.random() * 25) + 5));

    // Derive candidate name cleanly from filename if not specified
    const rawFileName = req.file.originalname || 'Resume.pdf';
    const parsedNameFromDoc = path.parse(rawFileName).name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const finalCandidateName = (candidateName && String(candidateName).trim()) ? String(candidateName).trim() : (parsedNameFromDoc || 'Applicant');
    const finalEmail = (email && String(email).trim()) ? String(email).trim() : `applicant_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    const finalPhone = (phone && String(phone).trim()) ? String(phone).trim() : '+91 98765 43210';

    // Duplicate check by email or phone
    let existingCand = null;
    try {
      existingCand = await Candidate.findOne({ 
        $or: [
          { email: finalEmail }, 
          { phone: finalPhone }
        ] 
      });
    } catch (e) {
      existingCand = null;
    }
    const isDuplicate = !!existingCand;

    const newAnalysis = new ResumeAnalysis({
      candidateName: finalCandidateName,
      email: finalEmail,
      phone: finalPhone,
      fileName: rawFileName,
      filePath: filePath,
      fileType: path.extname(rawFileName).replace('.', '').toLowerCase() || 'pdf',
      parsedSkills: extractedSkills,
      parsedQualifications: ['B.Tech Computer Science', 'M.Tech / Equivalent'],
      experienceYears: Math.floor(Math.random() * 6) + 2,
      parsedCertifications: ['AWS Certified Developer', 'Scrum Master'],
      extractedText: `Professional resume summary for ${finalCandidateName}. Expertise in full-stack architecture, API backend engineering, microservices.`,
      targetRole: targetRole || 'Senior Software Engineer',
      jdMatchScore,
      matchedSkills,
      missingSkills,
      skillGapAnalysis: `Matched ${matchedSkills.length} key skills. Missing: ${missingSkills.join(', ') || 'None'}. Excellent fit for core stack.`,
      rankingScore,
      isDuplicate,
      duplicateCandidateId: existingCand ? existingCand._id : null,
      recruiterRemarks: jdMatchScore > 75 ? 'Strong candidate recommendation.' : 'Requires technical screening.',
      status: 'Parsed'
    });

    await newAnalysis.save();

    // Auto-create or link candidate record in isolated try/catch
    try {
      if (!existingCand) {
        const newCandidate = new Candidate({
          name: newAnalysis.candidateName || 'Applicant',
          role: newAnalysis.targetRole || 'Software Engineer',
          source: 'Resume Parser',
          experience: newAnalysis.experienceYears ? `${newAnalysis.experienceYears} Years` : '2 Years',
          stage: 'screening',
          email: newAnalysis.email,
          phone: newAnalysis.phone,
          skills: newAnalysis.parsedSkills.join(', '),
          jdMatchScore: newAnalysis.jdMatchScore,
          recruiterRemarks: newAnalysis.recruiterRemarks,
          resumeLink: filePath
        });
        await newCandidate.save();
        newAnalysis.candidateId = newCandidate._id;
        await newAnalysis.save();
      }
    } catch (candErr) {
      console.warn('Candidate link note:', candErr.message);
    }

    try {
      await logAudit(req, 'Resume', newAnalysis._id.toString(), 'CREATE', null, newAnalysis, `Parsed resume ${newAnalysis.fileName}`);
    } catch (auditErr) {
      console.warn('Audit log note:', auditErr.message);
    }

    res.status(201).json(newAnalysis);
  } catch (err) {
    res.status(400).json({ message: 'Error analyzing resume', error: err.message });
  }
});

router.put('/resumes/:id/trigger-interview', protect, async (req, res, next) => {
  try {
    const { interviewDate, remarks } = req.body;
    const analysis = await ResumeAnalysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'Resume analysis not found' });

    analysis.status = 'Interview Triggered';
    analysis.interviewTriggered = true;
    analysis.interviewDate = interviewDate || new Date();
    analysis.recruiterRemarks = remarks || analysis.recruiterRemarks;
    await analysis.save();

    if (analysis.candidateId) {
      const cand = await Candidate.findById(analysis.candidateId);
      if (cand) {
        cand.stage = 'interview';
        cand.interviewStage = 'Technical Round 1 Scheduled';
        cand.interviewHistory.push({
          roundName: 'Technical Round 1',
          interviewerName: req.user?.name || 'Lead Architect',
          scheduledDate: analysis.interviewDate,
          status: 'Scheduled'
        });
        await cand.save();
      }
    }

    await logAudit(req, 'Resume', analysis._id.toString(), 'UPDATE', null, analysis, `Interview triggered for ${analysis.candidateName}`);
    res.json(analysis);
  } catch (err) {
    res.status(400).json({ message: 'Error triggering interview', error: err.message });
  }
});

// ==========================================
// 6. CANDIDATE DATABASE (360 VIEW)
// ==========================================
router.get('/candidates', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    let filter = { deletedAt: null };

    if (role === 'department_head' || role === 'reporting_manager' || role === 'hiring_manager') {
      const dept = req.user?.dept || 'Engineering';
      filter.$or = [{ department: dept }, { department: 'Engineering' }, { department: null }];
    } else if (role === 'finance' || role === 'payroll') {
      filter.stage = { $in: ['offered', 'selected', 'joined'] };
    } else if (role === 'employee') {
      filter.source = /referral/i;
    } else if (role === 'candidate') {
      filter.$or = [{ email: req.user?.email || 'candidate@hrorbit.internal' }, { stage: 'applied' }];
    } else if (role === 'recruiter') {
      filter.stage = { $in: ['applied', 'screening', 'interview', 'offered'] };
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) { next(err); }
});

router.post('/candidates', protect, async (req, res, next) => {
  try {
    const newCandidate = new Candidate({
      ...req.body,
      timeline: [{
        stage: req.body.stage || 'applied',
        title: 'Candidate Registered',
        description: 'Candidate profile entered into database.',
        updatedBy: req.user?.name || 'System'
      }]
    });
    await newCandidate.save();
    await logAudit(req, 'Candidate', newCandidate._id.toString(), 'CREATE', null, newCandidate, `Registered candidate ${newCandidate.name}`);
    res.status(201).json(newCandidate);
  } catch (err) {
    res.status(400).json({ message: 'Error creating candidate', error: err.message });
  }
});

router.put('/candidates/:id/stage', protect, async (req, res, next) => {
  try {
    const { stage, stageRejectedAt, rejectionReason, interviewStage } = req.body;
    const cand = await Candidate.findById(req.params.id);
    if (!cand) return res.status(404).json({ message: 'Candidate not found' });

    const prev = cand.toObject();
    cand.stage = stage;
    if (stageRejectedAt) cand.stageRejectedAt = stageRejectedAt;
    if (rejectionReason) cand.rejectionReason = rejectionReason;
    if (interviewStage) cand.interviewStage = interviewStage;

    cand.timeline.push({
      stage: stage,
      title: `Stage Changed to ${stage.toUpperCase()}`,
      description: rejectionReason ? `Rejected: ${rejectionReason}` : `Advanced to ${stage}`,
      updatedBy: req.user?.name || 'System'
    });

    await cand.save();
    await logAudit(req, 'Candidate', cand._id.toString(), 'UPDATE', prev, cand, `Moved candidate to ${stage}`);
    res.json(cand);
  } catch (err) {
    res.status(400).json({ message: 'Error updating candidate stage', error: err.message });
  }
});

// Offer Release
router.put('/candidates/:id/offer', protect, async (req, res, next) => {
  try {
    const { offeredCtc, joiningDate, offeredDesignation } = req.body;
    const cand = await Candidate.findById(req.params.id);
    if (!cand) return res.status(404).json({ message: 'Candidate not found' });

    cand.offerReleased = 'Yes';
    cand.stage = 'offered';
    cand.offerDetails = {
      offeredDesignation: offeredDesignation || cand.role,
      offeredCtc: offeredCtc || 1200000,
      joiningDate: joiningDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      offerStatus: 'Released',
      releasedDate: new Date()
    };
    cand.timeline.push({
      stage: 'offered',
      title: 'Formal Offer Letter Released',
      description: `Offer released for ${cand.role} with annual CTC ₹${(offeredCtc || 1200000).toLocaleString()}`,
      updatedBy: req.user?.name || 'HR Admin'
    });

    await cand.save();
    await logAudit(req, 'Candidate', cand._id.toString(), 'OFFER_RELEASE', null, cand, `Released offer letter to ${cand.name}`);
    res.json(cand);
  } catch (err) {
    res.status(400).json({ message: 'Error releasing offer', error: err.message });
  }
});

// Onboarding Joining Confirmation
router.put('/candidates/:id/join', protect, async (req, res, next) => {
  try {
    const cand = await Candidate.findById(req.params.id);
    if (!cand) return res.status(404).json({ message: 'Candidate not found' });

    cand.stage = 'joined';
    cand.joiningStatus = 'Onboarded';
    if (cand.offerDetails) cand.offerDetails.offerStatus = 'Accepted';

    cand.timeline.push({
      stage: 'joined',
      title: 'Candidate Successfully Onboarded',
      description: 'Candidate joined organization and transferred to Employee Roster.',
      updatedBy: req.user?.name || 'HR Admin'
    });

    await cand.save();
    await logAudit(req, 'Candidate', cand._id.toString(), 'JOINED', null, cand, `Confirmed joining of ${cand.name}`);
    res.json(cand);
  } catch (err) {
    res.status(400).json({ message: 'Error confirming candidate joining', error: err.message });
  }
});

// Communication Log Entry
router.post('/candidates/:id/communication', protect, async (req, res, next) => {
  try {
    const { medium, message } = req.body;
    const cand = await Candidate.findById(req.params.id);
    if (!cand) return res.status(404).json({ message: 'Candidate not found' });

    cand.communicationLog.push({
      sender: req.user?.name || 'Recruiter',
      medium: medium || 'Email',
      message: message,
      timestamp: new Date()
    });

    await cand.save();
    res.json(cand);
  } catch (err) {
    res.status(400).json({ message: 'Error adding communication log', error: err.message });
  }
});

// ==========================================
// 7. TALENT POOL SEARCH & REACTIVATION
// ==========================================
router.get('/talent-pool', protect, async (req, res, next) => {
  try {
    const pool = await TalentPool.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(pool);
  } catch (err) { next(err); }
});

router.post('/talent-pool', protect, async (req, res, next) => {
  try {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const newTalent = new TalentPool({
      ...req.body,
      expiryDate,
      created_by: req.user?.name || 'User'
    });
    await newTalent.save();
    await logAudit(req, 'TalentPool', newTalent._id.toString(), 'CREATE', null, newTalent, `Added ${newTalent.candidateName} to Talent Pool`);
    res.status(201).json(newTalent);
  } catch (err) {
    res.status(400).json({ message: 'Error adding talent pool entry', error: err.message });
  }
});

router.put('/talent-pool/:id/reactivate', protect, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const item = await TalentPool.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Talent pool record not found' });

    item.status = 'Reactivated';
    item.lastContactedDate = new Date();
    item.reactivationHistory.push({
      reactivatedBy: req.user?.name || 'Recruiter',
      reactivatedDate: new Date(),
      reason: reason || 'Re-considered for open vacancy'
    });

    await item.save();
    await logAudit(req, 'TalentPool', item._id.toString(), 'UPDATE', null, item, `Reactivated talent candidate ${item.candidateName}`);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error reactivating candidate', error: err.message });
  }
});

// ==========================================
// 8. RECRUITMENT COST TRACKING
// ==========================================
router.get('/costs', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    let filter = { deletedAt: null };

    if (role === 'candidate') {
      return res.json([]);
    }
    if (role === 'department_head' || role === 'recruiter') {
      const dept = req.user?.dept || 'Engineering';
      filter.$or = [{ department: dept }, { department: 'Engineering' }];
    }

    const costs = await RecruitmentCost.find(filter).sort({ createdAt: -1 });

    // Deduplicate records by _id and unique costId
    const seenIds = new Set();
    const seenNums = new Set();
    const dedupedCosts = [];
    for (const item of costs) {
      const idKey = String(item._id);
      const numKey = item.costId ? String(item.costId) : null;
      if (seenIds.has(idKey)) continue;
      if (numKey && seenNums.has(numKey)) continue;
      seenIds.add(idKey);
      if (numKey) seenNums.add(numKey);
      dedupedCosts.push(item);
    }

    res.json(dedupedCosts);
  } catch (err) { next(err); }
});

router.post('/costs', protect, async (req, res, next) => {
  try {
    const role = getRequestedRole(req);
    if (['candidate', 'employee'].includes(role)) {
      return res.status(403).json({ message: 'Unauthorized: insufficient role permissions to record recruitment expenses' });
    }

    // Idempotency check: prevent rapid duplicate submission within 10 seconds
    const existingDuplicate = await RecruitmentCost.findOne({
      costCategory: req.body.costCategory,
      vendorName: req.body.vendorName,
      department: req.body.department,
      amount: Number(req.body.amount) || 0,
      createdAt: { $gte: new Date(Date.now() - 10000) }
    });
    if (existingDuplicate) {
      return res.status(200).json(existingDuplicate);
    }

    // Determine next sequential costId reliably without collisions
    const count = await RecruitmentCost.countDocuments();
    const latestCost = await RecruitmentCost.findOne().sort({ createdAt: -1 });
    let nextSeq = count + 1;
    if (latestCost && latestCost.costId) {
      const match = latestCost.costId.match(/\d+$/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (!isNaN(parsed) && parsed >= nextSeq) {
          nextSeq = parsed + 1;
        }
      }
    }

    let costId = `COST-2026-${String(nextSeq).padStart(4, '0')}`;
    let exists = await RecruitmentCost.findOne({ costId });
    let attempts = 0;
    while (exists && attempts < 100) {
      nextSeq++;
      costId = `COST-2026-${String(nextSeq).padStart(4, '0')}`;
      exists = await RecruitmentCost.findOne({ costId });
      attempts++;
    }

    const newCost = new RecruitmentCost({
      ...req.body,
      costId,
      amount: Number(req.body.amount) || 0,
      costCategory: req.body.costCategory || 'Job Portal',
      department: req.body.department || 'Engineering',
      costCenter: req.body.costCenter || 'CC-101',
      recruiterId: req.user?.id || 'EMP-1004',
      recruiterName: req.user?.name || 'Recruiter',
      created_by: req.user?.name || 'User'
    });

    await newCost.save();
    await logAudit(req, 'Cost', newCost.costId, 'CREATE', null, newCost, `Recorded cost entry ₹${newCost.amount}`);
    res.status(201).json(newCost);
  } catch (err) {
    res.status(400).json({ message: 'Error saving recruitment cost', error: err.message });
  }
});

// ==========================================
// 9. MASTER TABLES CRUD
// ==========================================
router.get('/masters', protect, async (req, res, next) => {
  try {
    const masters = await RecruitmentMaster.find({ is_active: true }).sort({ category: 1, name: 1 });
    res.json(masters);
  } catch (err) { next(err); }
});

router.post('/masters', protect, async (req, res, next) => {
  try {
    const newMaster = new RecruitmentMaster(req.body);
    await newMaster.save();
    res.status(201).json(newMaster);
  } catch (err) {
    res.status(400).json({ message: 'Error creating master item', error: err.message });
  }
});

// ==========================================
// 10. RECRUITMENT AUDIT LOGS
// ==========================================
router.get('/audit-logs', protect, async (req, res, next) => {
  try {
    const logs = await RecruitmentAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) { next(err); }
});

module.exports = router;
