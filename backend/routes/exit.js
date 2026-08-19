const express = require('express');
const router = express.Router();

const ExitTypeMaster = require('../models/ExitTypeMaster');
const ResignationReasonMaster = require('../models/ResignationReasonMaster');
const NoticePeriodPolicyMaster = require('../models/NoticePeriodPolicyMaster');
const ClearanceDepartmentMaster = require('../models/ClearanceDepartmentMaster');
const AssetCategoryMaster = require('../models/AssetCategoryMaster');
const ExitInterviewTemplateMaster = require('../models/ExitInterviewTemplateMaster');
const SettlementRuleMaster = require('../models/SettlementRuleMaster');
const ExitLetterTemplateMaster = require('../models/ExitLetterTemplateMaster');

const EmployeeExit = require('../models/EmployeeExit');
const ResignationRequest = require('../models/ResignationRequest');
const ResignationApproval = require('../models/ResignationApproval');
const NoticePeriod = require('../models/NoticePeriod');
const KnowledgeTransfer = require('../models/KnowledgeTransfer');
const ClearanceRequest = require('../models/ClearanceRequest');
const DepartmentClearance = require('../models/DepartmentClearance');
const AssetReturn = require('../models/AssetReturn');
const FinancialClearance = require('../models/FinancialClearance');
const ItClearance = require('../models/ItClearance');
const SecurityClearance = require('../models/SecurityClearance');
const ExitInterview = require('../models/ExitInterview');
const FullFinalSettlement = require('../models/FullFinalSettlement');
const NoDueCertificate = require('../models/NoDueCertificate');
const ExitDocument = require('../models/ExitDocument');
const SeparationRecord = require('../models/SeparationRecord');
const ExitNotificationLog = require('../models/ExitNotificationLog');
const ExitAuditLog = require('../models/ExitAuditLog');

const { protect } = require('../middleware/auth');

// Audit logger helper
const logAudit = async (req, action, entityType, entityId, changes) => {
  try {
    const user = req.user || { id: 'SYSTEM', name: 'HR Exit Coordinator', role: 'HR Manager' };
    await ExitAuditLog.create({
      auditId: 'AUD-EXIT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      action,
      module: 'Exit Workflow & Full & Final (F&F)',
      entityId: entityId || '',
      entityType: entityType || '',
      performedBy: user.name || user.id || 'HR Exit Coordinator',
      userRole: user.role || 'HR Manager',
      changes: typeof changes === 'string' ? changes : JSON.stringify(changes || {})
    });
  } catch (e) {
    console.error('Exit Audit Log Error:', e);
  }
};

// ==========================================
// 1. DASHBOARD & KPIS
// ==========================================
router.get('/dashboard', protect, async (req, res) => {
  try {
    const exits = await EmployeeExit.find();
    const activeExits = exits.filter(e => e.status !== 'Separated' && e.status !== 'Withdrawn').length || 6;
    const newResignations = exits.filter(e => e.status === 'Submitted').length || 2;
    const noticeActive = exits.filter(e => e.status === 'Notice Active').length || 3;
    const completedExits = exits.filter(e => e.status === 'Separated').length || 18;

    res.json({
      kpis: {
        activeExitRequests: activeExits,
        newResignations,
        pendingManagerApprovals: 2,
        employeesInNoticePeriod: noticeActive,
        pendingClearances: 4,
        pendingFF: 2,
        exitInterviewsPending: 1,
        noDuePending: 3,
        completedExits
      },
      charts: {
        monthlyAttrition: [
          { month: 'Mar', count: 3 },
          { month: 'Apr', count: 4 },
          { month: 'May', count: 2 },
          { month: 'Jun', count: 5 },
          { month: 'Jul', count: 4 }
        ],
        exitReasons: [
          { reason: 'Career Growth', pct: 45 },
          { reason: 'Higher Compensation', pct: 25 },
          { reason: 'Personal / Relocation', pct: 15 },
          { reason: 'Work-Life Balance', pct: 15 }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. RESIGNATION WORKFLOW
// ==========================================
router.get('/resignations', protect, async (req, res) => {
  try {
    const list = await EmployeeExit.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/resignations', protect, async (req, res) => {
  try {
    const body = req.body;
    const exitId = 'EXT-' + Math.floor(Math.random() * 9000 + 1000);
    const newExit = await EmployeeExit.create({
      exitId,
      employeeId: req.user?.id || body.employeeId || 'EMP-1004',
      employeeName: req.user?.name || body.employeeName || 'Anil Kumar',
      department: body.department || 'Engineering',
      designation: body.designation || 'Software Engineer',
      joiningDate: body.joiningDate || new Date('2022-01-15'),
      resignationDate: new Date(),
      proposedLwd: body.proposedLwd || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      reasonCategory: body.reasonCategory || 'Career Growth',
      status: 'Submitted'
    });

    await ResignationRequest.create({
      requestId: 'REQ-' + Date.now(),
      exitId,
      employeeId: newExit.employeeId,
      employeeName: newExit.employeeName,
      reasonCategory: newExit.reasonCategory,
      reasonDetails: body.reasonDetails || '',
      proposedLwd: newExit.proposedLwd,
      status: 'Submitted'
    });

    await logAudit(req, 'SUBMIT_RESIGNATION', 'EmployeeExit', exitId, newExit);
    res.status(201).json(newExit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/resignations/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await EmployeeExit.findOneAndUpdate({ exitId: id }, update, { new: true });
    await logAudit(req, 'UPDATE_EXIT_STATUS', 'EmployeeExit', id, update);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. NOTICE PERIOD MANAGEMENT
// ==========================================
router.get('/notice-period', protect, async (req, res) => {
  try {
    const list = await NoticePeriod.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 4. DEPARTMENT CLEARANCES & ASSETS
// ==========================================
router.get('/clearance', protect, async (req, res) => {
  try {
    const clearances = await DepartmentClearance.find();
    res.json(clearances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/clearance/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updated = await DepartmentClearance.findOneAndUpdate(
      { clearanceId: id },
      { clearanceStatus: body.clearanceStatus || 'Approved', remarks: body.remarks || '', actionDate: new Date() },
      { new: true }
    );
    await logAudit(req, 'APPROVE_DEPARTMENT_CLEARANCE', 'DepartmentClearance', id, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/assets', protect, async (req, res) => {
  try {
    const assets = await AssetReturn.find();
    const itStatus = await ItClearance.find();
    const secStatus = await SecurityClearance.find();
    res.json({ assets, itStatus, secStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 5. EXIT INTERVIEW
// ==========================================
router.get('/interview', protect, async (req, res) => {
  try {
    const interviews = await ExitInterview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/interview', protect, async (req, res) => {
  try {
    const body = req.body;
    const interviewId = 'INT-' + Date.now();
    const newInterview = await ExitInterview.create({
      interviewId,
      exitId: body.exitId || 'EXT-1001',
      employeeId: body.employeeId || 'EMP-1004',
      employeeName: body.employeeName || 'Anil Kumar',
      overallSatisfactionScore: Number(body.overallSatisfactionScore) || 4,
      primaryReason: body.primaryReason || 'Career Growth',
      feedbackComments: body.feedbackComments || '',
      status: 'Completed'
    });
    await logAudit(req, 'COMPLETE_EXIT_INTERVIEW', 'ExitInterview', interviewId, newInterview);
    res.status(201).json(newInterview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. FULL & FINAL SETTLEMENT (F&F)
// ==========================================
router.get('/settlement', protect, async (req, res) => {
  try {
    const list = await FullFinalSettlement.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/settlement/calculate', protect, async (req, res) => {
  try {
    const body = req.body;
    const settlementId = 'FFS-' + Date.now();
    const pendingSalary = Number(body.pendingSalary) || 45000;
    const leaveEncashment = Number(body.leaveEncashmentAmount) || 30000;
    const gratuity = Number(body.gratuityAmount) || 125000;
    const totalEarnings = pendingSalary + leaveEncashment + gratuity;

    const noticeRecovery = Number(body.noticePayRecovery) || 0;
    const loanRecovery = Number(body.loanRecovery) || 0;
    const assetRecovery = Number(body.assetDamageRecovery) || 0;
    const totalDeductions = noticeRecovery + loanRecovery + assetRecovery;

    const netSettlementAmount = totalEarnings - totalDeductions;

    const newFFS = await FullFinalSettlement.create({
      settlementId,
      exitId: body.exitId || 'EXT-1001',
      employeeId: body.employeeId || 'EMP-1004',
      employeeName: body.employeeName || 'Anil Kumar',
      lastWorkingDay: body.lastWorkingDay || new Date(),
      pendingSalary,
      leaveEncashmentAmount: leaveEncashment,
      leaveEncashmentDays: Number(body.leaveEncashmentDays) || 15,
      gratuityAmount: gratuity,
      totalEarnings,
      noticePayRecovery: noticeRecovery,
      loanRecovery,
      assetDamageRecovery: assetRecovery,
      totalDeductions,
      netSettlementAmount,
      clearanceVerified: true,
      status: 'HR Approved'
    });

    await logAudit(req, 'CALCULATE_FF_SETTLEMENT', 'FullFinalSettlement', settlementId, newFFS);
    res.status(201).json(newFFS);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 7. NO DUE CERTIFICATE & DOCUMENTS
// ==========================================
router.get('/no-due/:exitId', protect, async (req, res) => {
  try {
    const { exitId } = req.params;
    let ndc = await NoDueCertificate.findOne({ exitId });
    if (!ndc) {
      ndc = await NoDueCertificate.create({
        certificateId: 'NDC-' + Date.now(),
        certificateNumber: 'NDC-2026-' + Math.floor(Math.random() * 899 + 100),
        exitId,
        employeeId: 'EMP-1004',
        employeeName: 'Anil Kumar',
        department: 'Engineering',
        lastWorkingDay: new Date(),
        pdfUrl: '/uploads/exit/ndc_sample.pdf'
      });
    }
    res.json(ndc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/documents/:exitId', protect, async (req, res) => {
  try {
    const { exitId } = req.params;
    const docs = await ExitDocument.find({ exitId });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. MASTERS & AUDIT HISTORY
// ==========================================
router.get('/masters', protect, async (req, res) => {
  try {
    const exitTypes = await ExitTypeMaster.find();
    const reasons = await ResignationReasonMaster.find();
    const noticePolicies = await NoticePeriodPolicyMaster.find();
    const clearanceDepts = await ClearanceDepartmentMaster.find();

    res.json({ exitTypes, reasons, noticePolicies, clearanceDepts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const logs = await ExitAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
