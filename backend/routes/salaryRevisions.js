const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const SalaryRevisionRequest = require('../models/SalaryRevisionRequest');
const SalaryRevisionHistory = require('../models/SalaryRevisionHistory');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to generate next request ID
const generateRequestId = async () => {
  const year = new Date().getFullYear();
  const count = await SalaryRevisionRequest.countDocuments({
    requestId: new RegExp(`^SRV-${year}-`)
  });
  const nextNum = String(count + 1).padStart(4, '0');
  return `SRV-${year}-${nextNum}`;
};

// @route   GET /api/salary-revisions
// @desc    Get all requests and dashboard summary
router.get('/', protect, async (req, res) => {
  try {
    const list = await SalaryRevisionRequest.find({}).sort({ createdAt: -1 });

    const total = list.length;
    const pending = list.filter(r => ['Pending Verification', 'Pending Approval'].includes(r.status)).length;
    const approved = list.filter(r => r.status === 'Approved').length;
    const rejected = list.filter(r => r.status === 'Rejected').length;

    // Cost Impact Summary (accumulated CTC changes of approved revisions)
    let totalCostImpact = 0;
    list.filter(r => r.status === 'Approved').forEach(r => {
      totalCostImpact += r.incrementAmount;
    });

    res.json({
      data: list,
      summary: {
        total,
        pending,
        approved,
        rejected,
        totalCostImpact
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/salary-revisions
// @desc    Initiate new salary revision request
router.post('/', protect, async (req, res) => {
  const { 
    employeeId, revisionType, effectiveDate, reason, attachmentUrl,
    currentCtc, currentGross, currentBasic, currentAllowances,
    revisedCtc, revisedGross, revisedBasic, revisedAllowances
  } = req.body;

  if (!employeeId || !revisionType || !revisedCtc || !effectiveDate) {
    return res.status(400).json({ message: 'Employee ID, revision type, proposed CTC, and effective date are required.' });
  }

  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });

    // Business Rule Check: Employee must be Active
    if (emp.status !== 'Approved') {
      return res.status(400).json({ message: 'Salary revisions are only applicable for active, onboarded employees.' });
    }

    // Business Rule Check: Effective date cannot be earlier than joining date
    const joined = emp.joined ? new Date(emp.joined) : new Date(0);
    if (new Date(effectiveDate) < joined) {
      return res.status(400).json({ message: 'Effective date cannot be earlier than employee joining date.' });
    }

    // Resolve Manager Details
    let currentManagerName = '';
    if (emp.functionalManagerId) {
      const mgr = await Employee.findOne({ id: emp.functionalManagerId });
      if (mgr) currentManagerName = mgr.name;
    }

    // Automatic calculation logic
    const curCtcVal = currentCtc || 50000; // default benchmark fallback
    const incAmount = revisedCtc - curCtcVal;
    const incPercentage = Math.round((incAmount / curCtcVal) * 100) || 0;

    const reqId = await generateRequestId();

    const request = await SalaryRevisionRequest.create({
      requestId: reqId,
      employeeId,
      employeeName: emp.name,
      currentDepartment: emp.dept,
      currentDesignation: emp.designation || 'Staff',
      currentGrade: emp.grade || 'A1',
      currentManagerId: emp.functionalManagerId || '',
      currentManagerName,
      revisionType,
      effectiveDate,
      reason,
      attachmentUrl,
      
      currentCtc: curCtcVal,
      currentGross: currentGross || Math.round(curCtcVal * 0.9),
      currentBasic: currentBasic || Math.round(curCtcVal * 0.5),
      currentAllowances: currentAllowances || Math.round(curCtcVal * 0.4),

      revisedCtc,
      revisedGross: revisedGross || Math.round(revisedCtc * 0.9),
      revisedBasic: revisedBasic || Math.round(revisedCtc * 0.5),
      revisedAllowances: revisedAllowances || Math.round(revisedCtc * 0.4),

      incrementAmount: incAmount,
      incrementPercentage: incPercentage,
      status: 'Pending Verification',
      approvalHistory: [{
        status: 'Pending Verification',
        actorName: req.user.name,
        comments: 'Salary revision request initiated.'
      }],
      auditLog: [{
        action: 'INITIATE_SALARY_REVISION',
        actorName: req.user.name,
        details: `Initiated salary revision request ${reqId} for ${emp.name}.`
      }]
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/salary-revisions/:id/action
// @desc    Submit approval step decision (Approve/Reject/Hold/Send Back)
router.put('/:id/action', protect, async (req, res) => {
  const { decision, comments } = req.body; // 'Approved' | 'Rejected' | 'Hold' | 'Sent Back'

  try {
    const reqObj = await SalaryRevisionRequest.findById(req.params.id);
    if (!reqObj) return res.status(404).json({ message: 'Salary revision request not found.' });

    reqObj.status = decision;
    reqObj.remarks = comments || '';

    let detailsText = `Decision processed: ${decision}.`;

    if (decision === 'Approved') {
      const letter = `SALARY REVISION ADVISORY\n\nRequest ID: ${reqObj.requestId}\n\nDear ${reqObj.employeeName},\n\nWe are pleased to inform you that your compensation structure has been officially revised. Details:\n\n• Revision Type: ${reqObj.revisionType}\n• New Revised CTC: ${reqObj.revisedCtc} INR\n• Increment Amount: ${reqObj.incrementAmount} INR (${reqObj.incrementPercentage}% Increase)\n• Effective Date: ${new Date(reqObj.effectiveDate).toLocaleDateString()}\n\nSincerely,\nHR & Finance Management`;
      
      reqObj.letterUrl = 'salary_revision_letter_' + reqObj.employeeId + '.txt';

      // Log into SalaryRevisionHistory
      await SalaryRevisionHistory.create({
        employeeId: reqObj.employeeId,
        employeeName: reqObj.employeeName,
        oldSalary: reqObj.currentCtc,
        newSalary: reqObj.revisedCtc,
        effectiveDate: reqObj.effectiveDate,
        approvedBy: req.user.name,
        reason: `Salary Revision: ${reqObj.revisionType}`
      });

      // Update Employee master profile or cost center mappings
      // If employee has custom salary fields, updates here.

      // Notify Employee
      await Notification.create({
        type: 'reminder',
        title: 'Salary Structure Revised',
        desc: `Your salary revision ${reqObj.requestId} has been approved. Effective Date: ${new Date(reqObj.effectiveDate).toLocaleDateString()}`,
        empId: reqObj.employeeId
      });

      detailsText += ` Generated salary revision letter and updated employee history logs.`;
    }

    reqObj.approvalHistory.push({
      status: decision,
      actorName: req.user.name,
      comments: comments || ''
    });

    reqObj.auditLog.push({
      action: `DECISION_${decision.toUpperCase()}`,
      actorName: req.user.name,
      details: detailsText
    });

    await reqObj.save();

    res.json(reqObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/salary-revisions/:id/acknowledge
// @desc    Employee acknowledge revision letter
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const reqObj = await SalaryRevisionRequest.findById(req.params.id);
    if (!reqObj) return res.status(404).json({ message: 'Salary revision request not found.' });

    reqObj.acknowledged = true;
    reqObj.acceptanceDate = new Date();

    reqObj.approvalHistory.push({
      status: 'Acknowledged',
      actorName: req.user.name,
      comments: 'Employee signed salary revision terms.'
    });

    reqObj.auditLog.push({
      action: 'EMPLOYEE_ACKNOWLEDGEMENT',
      actorName: req.user.name,
      details: `Employee accepted and acknowledged salary revision structure.`
    });

    await reqObj.save();

    res.json(reqObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/salary-revisions/reports
// @desc    Get aggregated cost comparison and revisions list
router.get('/reports', protect, async (req, res) => {
  try {
    const approvedList = await SalaryRevisionRequest.find({ status: 'Approved' }).sort({ effectiveDate: -1 });
    const historyList = await SalaryRevisionHistory.find({}).sort({ effectiveDate: -1 });

    res.json({
      approvedList,
      historyList
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
