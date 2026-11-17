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

const { protect, adminOnly } = require('../middleware/auth');
const { requireFields } = require('../utils/validate');

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
router.get('/dashboard', protect, adminOnly, async (req, res, next) => {
  try {
    const [exits, pendingClearances] = await Promise.all([
      EmployeeExit.find().lean(),
      DepartmentClearance.countDocuments({ clearanceStatus: { $in: ['Pending', 'On Hold'] } })
    ]);
    const withStatus = (...statuses) => exits.filter(e => statuses.includes(e.status)).length;
    const reasonCounts = {};
    for (const e of exits) reasonCounts[e.reasonCategory] = (reasonCounts[e.reasonCategory] || 0) + 1;

    res.json({
      kpis: {
        activeExitRequests: exits.filter(e => e.status !== 'Separated' && e.status !== 'Withdrawn').length,
        newResignations: withStatus('Submitted'),
        pendingReviews: withStatus('Manager Review', 'HR Review'),
        employeesInNoticePeriod: withStatus('Notice Active'),
        clearanceInProgress: withStatus('Clearance In Progress'),
        pendingClearances,
        pendingFF: withStatus('F&F Pending'),
        completedExits: withStatus('Separated')
      },
      charts: {
        exitReasons: Object.entries(reasonCounts)
          .map(([reason, count]) => ({ reason, count, pct: Math.round(count / exits.length * 100) }))
          .sort((x, y) => y.count - x.count)
      }
    });
  } catch (err) { next(err); }
});

// ==========================================
// 2. RESIGNATION WORKFLOW
// ==========================================
// Employees see only their own exit case; HR sees all.
const ownScope = (req) => req.user.role === 'hr' ? {} : { employeeId: req.user.id };

router.get('/resignations', protect, async (req, res, next) => {
  try {
    const list = await EmployeeExit.find(ownScope(req)).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/resignations', protect, async (req, res, next) => {
  try {
    const body = req.body;
    requireFields(body, { proposedLwd: 'Proposed last working day', reasonCategory: 'Reason' });
    const exitId = 'EXT-' + Math.floor(Math.random() * 9000 + 1000);
    // A resignation is always the signed-in person's own; their details come from their employee record.
    const newExit = await EmployeeExit.create({
      exitId,
      employeeId: req.user.id,
      employeeName: req.user.name,
      department: req.user.dept,
      designation: req.user.designation || '',
      joiningDate: req.user.joined,
      resignationDate: new Date(),
      proposedLwd: body.proposedLwd,
      reasonCategory: body.reasonCategory,
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
  } catch (err) { next(err); }
});

router.put('/resignations/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await EmployeeExit.findOneAndUpdate({ exitId: id }, update, { new: true });
    await logAudit(req, 'UPDATE_EXIT_STATUS', 'EmployeeExit', id, update);
    res.json(updated);
  } catch (err) { next(err); }
});

// ==========================================
// 3. NOTICE PERIOD MANAGEMENT
// ==========================================
router.get('/notice-period', protect, async (req, res, next) => {
  try {
    const list = await NoticePeriod.find(ownScope(req)).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

// ==========================================
// 4. DEPARTMENT CLEARANCES & ASSETS
// ==========================================
router.get('/clearance', protect, async (req, res, next) => {
  try {
    const exitIds = req.user.role === 'hr' ? null : (await EmployeeExit.find(ownScope(req)).select('exitId')).map(e => e.exitId);
    const clearances = await DepartmentClearance.find(exitIds ? { exitId: { $in: exitIds } } : {}).sort({ exitId: 1, createdAt: 1 });
    res.json(clearances);
  } catch (err) { next(err); }
});

// Departments that must sign off before a No Due Certificate can be issued: the active mandatory
// entries of the clearance master, or this standard set when the master is empty.
const STANDARD_CLEARANCES = ['Reporting Manager', 'IT', 'Finance', 'Admin', 'HR'];
const requiredDepartments = async () => {
  const fromMaster = await ClearanceDepartmentMaster.find({ status: 'Active', isMandatory: true }).distinct('departmentName');
  return fromMaster.length ? fromMaster : STANDARD_CLEARANCES;
};

// Where an exit case stands: every required department's clearance, which are still open, and
// whether a certificate may be issued (all required departments Approved).
const clearanceStatus = async (exitId) => {
  const [required, records, settlement, certificate] = await Promise.all([
    requiredDepartments(),
    DepartmentClearance.find({ exitId }).sort({ createdAt: 1 }).lean(),
    FullFinalSettlement.findOne({ exitId }).lean(),
    NoDueCertificate.findOne({ exitId }).lean()
  ]);
  const byDept = Object.fromEntries(records.map(r => [r.departmentName, r]));
  const pending = required.filter(d => byDept[d]?.clearanceStatus !== 'Approved');
  return { required, clearances: records, pending, started: records.length > 0, allCleared: pending.length === 0, settlement, certificate };
};

// HR opens the clearance checklist for an exit case: one task per required department (idempotent).
router.post('/clearance/start/:exitId', protect, adminOnly, async (req, res, next) => {
  try {
    const { exitId } = req.params;
    const exitCase = await EmployeeExit.findOne({ exitId });
    if (!exitCase) return res.status(404).json({ message: 'Exit case not found.' });
    const existing = await DepartmentClearance.find({ exitId }).distinct('departmentName');
    const missing = (await requiredDepartments()).filter(d => !existing.includes(d));
    const stamp = Date.now();
    await DepartmentClearance.insertMany(missing.map((departmentName, i) => ({ clearanceId: `CLR-${stamp}-${i + 1}`, exitId, departmentName })));
    if (exitCase.status !== 'Separated') await EmployeeExit.updateOne({ exitId }, { status: 'Clearance In Progress' });
    await logAudit(req, 'START_EXIT_CLEARANCE', 'EmployeeExit', exitId, { created: missing });
    res.status(missing.length ? 201 : 200).json(await clearanceStatus(exitId));
  } catch (err) { next(err); }
});

router.put('/clearance/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clearanceStatus: status, remarks } = req.body;
    if (!['Approved', 'Rejected', 'On Hold', 'Pending'].includes(status)) return res.status(400).json({ message: 'Choose a clearance status.' });
    if (status !== 'Approved' && !String(remarks || '').trim()) return res.status(400).json({ message: 'Please fill in: Remarks (why it is not approved).' });
    const current = await DepartmentClearance.findOne({ clearanceId: id });
    if (!current) return res.status(404).json({ message: 'Clearance not found.' });
    // An issued certificate certifies these sign-offs, so they can no longer be reopened.
    if (await NoDueCertificate.exists({ exitId: current.exitId })) return res.status(409).json({ message: 'A No Due Certificate has already been issued for this exit case.' });
    const updated = await DepartmentClearance.findOneAndUpdate(
      { clearanceId: id },
      { clearanceStatus: status, remarks: String(remarks || '').trim(), approverId: req.user.id, approverName: req.user.name, actionDate: new Date() },
      { new: true }
    );
    await logAudit(req, 'UPDATE_DEPARTMENT_CLEARANCE', 'DepartmentClearance', id, updated);
    res.json(updated);
  } catch (err) { next(err); }
});

router.get('/assets', protect, async (req, res, next) => {
  try {
    const assets = await AssetReturn.find(ownScope(req));
    const itStatus = await ItClearance.find(ownScope(req));
    const secStatus = await SecurityClearance.find(ownScope(req));
    res.json({ assets, itStatus, secStatus });
  } catch (err) { next(err); }
});

// ==========================================
// 5. EXIT INTERVIEW
// ==========================================
router.get('/interview', protect, async (req, res, next) => {
  try {
    const interviews = await ExitInterview.find(ownScope(req)).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) { next(err); }
});

router.post('/interview', protect, async (req, res, next) => {
  try {
    const body = req.body;
    // Employees record their own interview; HR may record it for the exiting employee.
    const employeeId = req.user.role === 'hr' ? body.employeeId : req.user.id;
    const employeeName = req.user.role === 'hr' ? body.employeeName : req.user.name;
    const score = Number(body.overallSatisfactionScore);
    if (!body.exitId || !employeeId) return res.status(400).json({ message: 'Exit ID and employee are required.' });
    requireFields(body, { primaryReason: 'Primary reason' });
    if (!(score >= 1 && score <= 5)) return res.status(400).json({ message: 'Overall satisfaction must be between 1 and 5.' });
    const interviewId = 'INT-' + Date.now();
    const newInterview = await ExitInterview.create({
      interviewId,
      exitId: body.exitId,
      employeeId,
      employeeName,
      overallSatisfactionScore: score,
      primaryReason: body.primaryReason,
      feedbackComments: body.feedbackComments || '',
      status: 'Completed'
    });
    await logAudit(req, 'COMPLETE_EXIT_INTERVIEW', 'ExitInterview', interviewId, newInterview);
    res.status(201).json(newInterview);
  } catch (err) { next(err); }
});

// ==========================================
// 6. FULL & FINAL SETTLEMENT (F&F)
// ==========================================
router.get('/settlement', protect, async (req, res, next) => {
  try {
    const list = await FullFinalSettlement.find(ownScope(req)).sort({ createdAt: -1 });
    // Deduplicate settlements by exitId / settlementId to prevent duplicate rows in register
    const seen = new Set();
    const deduped = [];
    for (const item of list) {
      const key = item.exitId || item.settlementId;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }
    res.json(deduped);
  } catch (err) { next(err); }
});

router.post('/settlement/calculate', protect, adminOnly, async (req, res, next) => {
  try {
    const body = req.body;
    // Money fields: 0 is a real value; missing or non-numeric is an error, never a made-up default
    const amount = (key, required) => {
      const raw = body[key];
      if (raw === undefined || raw === null || raw === '') return required ? NaN : 0;
      const n = Number(raw);
      return n >= 0 ? n : NaN;
    };
    const exitId = body.exitId;
    const pendingSalary = amount('pendingSalary', true);
    const leaveEncashment = amount('leaveEncashmentAmount', true);
    const gratuity = amount('gratuityAmount', true);
    const noticeRecovery = amount('noticePayRecovery', false);
    const loanRecovery = amount('loanRecovery', false);
    const assetRecovery = amount('assetDamageRecovery', false);
    const bad = [['pendingSalary', pendingSalary], ['leaveEncashmentAmount', leaveEncashment], ['gratuityAmount', gratuity],
      ['noticePayRecovery', noticeRecovery], ['loanRecovery', loanRecovery], ['assetDamageRecovery', assetRecovery]]
      .filter(([, v]) => Number.isNaN(v)).map(([k]) => k);
    if (!exitId || bad.length) {
      return res.status(400).json({ message: `Please enter valid amounts (0 or more) for: ${[...(exitId ? [] : ['exitId']), ...bad].join(', ')}` });
    }
    const totalEarnings = pendingSalary + leaveEncashment + gratuity;
    const totalDeductions = noticeRecovery + loanRecovery + assetRecovery;

    const netSettlementAmount = totalEarnings - totalDeductions;

    const calculated = {
      pendingSalary,
      leaveEncashmentAmount: leaveEncashment,
      leaveEncashmentDays: Number(body.leaveEncashmentDays) || 0,
      gratuityAmount: gratuity,
      totalEarnings,
      noticePayRecovery: noticeRecovery,
      loanRecovery,
      assetDamageRecovery: assetRecovery,
      totalDeductions,
      netSettlementAmount,
      clearanceVerified: (await clearanceStatus(exitId)).allCleared,
      status: 'HR Approved'
    };

    const existed = await FullFinalSettlement.findOne({ exitId });
    const exitCase = await EmployeeExit.findOne({ exitId });
    if (!exitCase) return res.status(404).json({ message: 'Exit case not found. Choose an existing exit case.' });

    // Bug 041: single atomic upsert instead of find-then-create, so one exit case maps to one settlement
    let ffs = await FullFinalSettlement.findOneAndUpdate(
      { exitId },
      {
        $set: calculated,
        $setOnInsert: {
          settlementId: 'FFS-' + Date.now(),
          employeeId: exitCase.employeeId,
          employeeName: exitCase.employeeName,
          lastWorkingDay: body.lastWorkingDay || exitCase.approvedLwd || exitCase.proposedLwd
        }
      },
      { upsert: true, new: true, sort: { createdAt: 1 } }
    );

    // exitId has no unique index, so near-simultaneous upserts can still both insert.
    // Collapse any duplicates onto the OLDEST record so concurrent requests all keep the same one.
    const sameExit = await FullFinalSettlement.find({ exitId }).sort({ createdAt: 1, _id: 1 }).select('_id');
    if (sameExit.length > 1) {
      if (!sameExit[0]._id.equals(ffs._id)) {
        ffs = await FullFinalSettlement.findByIdAndUpdate(sameExit[0]._id, { $set: calculated }, { new: true });
      }
      await FullFinalSettlement.deleteMany({ exitId, _id: { $ne: ffs._id } });
    }

    if (existed) {
      await logAudit(req, 'UPDATE_FF_SETTLEMENT', 'FullFinalSettlement', ffs.settlementId, ffs);
      return res.json(ffs);
    }

    await logAudit(req, 'CALCULATE_FF_SETTLEMENT', 'FullFinalSettlement', ffs.settlementId, ffs);
    res.status(201).json(ffs);
  } catch (err) {
    if (err.code === 11000 && req.body.exitId) {
      try {
        const existing = await FullFinalSettlement.findOne({ exitId: req.body.exitId });
        if (existing) return res.json(existing);
      } catch (innerErr) {}
    }
    next(err);
  }
});

// ==========================================
// 7. NO DUE CERTIFICATE & DOCUMENTS
// ==========================================
// Clearance status of one exit case. HR, or the exiting employee for their own case.
router.get('/no-due/:exitId', protect, async (req, res, next) => {
  try {
    const exitCase = await EmployeeExit.findOne({ exitId: req.params.exitId, ...ownScope(req) }).lean();
    if (!exitCase) return res.status(404).json({ message: 'Exit case not found.' });
    res.json({ exitCase, ...(await clearanceStatus(exitCase.exitId)) });
  } catch (err) { next(err); }
});

// Issue the No Due Certificate. HR only, and only once every required department has approved.
router.post('/no-due/:exitId', protect, adminOnly, async (req, res, next) => {
  try {
    const exitCase = await EmployeeExit.findOne({ exitId: req.params.exitId });
    if (!exitCase) return res.status(404).json({ message: 'Exit case not found.' });
    const status = await clearanceStatus(exitCase.exitId);
    if (status.certificate) return res.json({ exitCase, ...status });
    if (!status.started || !status.allCleared) {
      return res.status(409).json({ message: `Clearance pending: ${status.pending.join(', ')}.`, pending: status.pending });
    }
    const seq = await NoDueCertificate.countDocuments() + 1;
    const done = (d) => status.clearances.some(c => c.departmentName === d && c.clearanceStatus === 'Approved');
    await NoDueCertificate.create({
      certificateId: 'NDC-' + Date.now(),
      certificateNumber: `NDC-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`,
      exitId: exitCase.exitId,
      employeeId: exitCase.employeeId,
      employeeName: exitCase.employeeName,
      department: exitCase.department,
      lastWorkingDay: exitCase.approvedLwd || exitCase.proposedLwd,
      hrCleared: done('HR'), financeCleared: done('Finance'), payrollCleared: done('Payroll'), itCleared: done('IT'),
      securityCleared: done('Security'), assetsCleared: done('Admin'), complianceCleared: done('Compliance'),
      digitalSignatureHash: '', qrVerificationCode: ''
    });
    await logAudit(req, 'ISSUE_NO_DUE_CERTIFICATE', 'EmployeeExit', exitCase.exitId, { issuedBy: req.user.name });
    res.status(201).json({ exitCase, ...(await clearanceStatus(exitCase.exitId)) });
  } catch (err) { next(err); }
});

router.get('/documents/:exitId', protect, async (req, res, next) => {
  try {
    const { exitId } = req.params;
    const docs = await ExitDocument.find({ exitId });
    res.json(docs);
  } catch (err) { next(err); }
});

// ==========================================
// 8. MASTERS & AUDIT HISTORY
// ==========================================
router.get('/masters', protect, async (req, res, next) => {
  try {
    const exitTypes = await ExitTypeMaster.find();
    const reasons = await ResignationReasonMaster.find();
    const noticePolicies = await NoticePeriodPolicyMaster.find();
    const clearanceDepts = await ClearanceDepartmentMaster.find();

    res.json({ exitTypes, reasons, noticePolicies, clearanceDepts });
  } catch (err) { next(err); }
});

router.get('/history', protect, adminOnly, async (req, res, next) => {
  try {
    const logs = await ExitAuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) { next(err); }
});

module.exports = router;
