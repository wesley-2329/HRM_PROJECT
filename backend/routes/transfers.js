const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const TransferRequest = require('../models/TransferRequest');
const DepartmentTransferHistory = require('../models/DepartmentTransferHistory');
const EmployeeReportingHistory = require('../models/EmployeeReportingHistory');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to generate next transaction number
const generateTransferNum = async () => {
  const year = new Date().getFullYear();
  const count = await TransferRequest.countDocuments({
    transferNumber: new RegExp(`^TRN-${year}-`)
  });
  const nextNum = String(count + 1).padStart(4, '0');
  return `TRN-${year}-${nextNum}`;
};

// @route   GET /api/transfers
// @desc    Get all transfers list and dashboard count summary
router.get('/', protect, async (req, res) => {
  try {
    const list = await TransferRequest.find({}).sort({ createdAt: -1 });

    const total = list.length;
    const pending = list.filter(t => ['Pending Recommendation', 'Pending Approval', 'Under HR Review'].includes(t.status)).length;
    const approved = list.filter(t => t.status === 'Approved').length;
    const rejected = list.filter(t => t.status === 'Rejected').length;

    res.json({
      data: list,
      summary: {
        total,
        pending,
        approved,
        rejected
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/transfers
// @desc    Initiate transfer request
router.post('/', protect, async (req, res) => {
  const { employeeId, transferType, transferReason, effectiveDate, remarks, attachmentUrl } = req.body;

  if (!employeeId || !transferType || !effectiveDate) {
    return res.status(400).json({ message: 'Employee ID, transfer type, and effective date are mandatory.' });
  }

  // Business Rule: Effective date cannot be backdated
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(effectiveDate) < today) {
    return res.status(400).json({ message: 'Effective date cannot be set in the past.' });
  }

  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee profile not found.' });

    // Validate active status (Approved onboarding status)
    if (emp.status !== 'Approved') {
      return res.status(400).json({ message: 'Employee must be actively onboarded to process transfers.' });
    }

    // Resolve Manager Name
    let currentManagerName = '';
    if (emp.functionalManagerId) {
      const mgr = await Employee.findOne({ id: emp.functionalManagerId });
      if (mgr) currentManagerName = mgr.name;
    }

    const trnNum = await generateTransferNum();

    const reqObj = await TransferRequest.create({
      transferNumber: trnNum,
      employeeId,
      employeeName: emp.name,
      currentDepartment: emp.dept,
      currentDesignation: emp.designation || 'Staff',
      currentLocation: emp.branch || 'Head Office',
      currentManagerId: emp.functionalManagerId || '',
      currentManagerName,
      transferType,
      transferReason,
      effectiveDate,
      remarks,
      attachmentUrl,
      status: 'Pending Recommendation',
      approvalHistory: [{
        status: 'Pending Recommendation',
        actorName: req.user.name,
        comments: 'Transfer request raised.'
      }],
      auditLog: [{
        action: 'INITIATE_TRANSFER',
        actorName: req.user.name,
        details: `Initiated transfer request ${trnNum} for ${emp.name}.`
      }]
    });

    // Notify Manager
    if (emp.functionalManagerId) {
      await Notification.create({
        type: 'reminder',
        title: 'Transfer Action Required',
        desc: `Transfer request ${trnNum} has been raised for ${emp.name} pending your review.`,
        empId: emp.functionalManagerId
      });
    }

    res.status(201).json(reqObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/transfers/:id/action
// @desc    Submit approval step decision (Approve/Reject/Send Back)
router.put('/:id/action', protect, async (req, res) => {
  const { decision, comments } = req.body; // 'Recommend' | 'Approve' | 'Process' | 'Reject' | 'Send Back'

  try {
    const trn = await TransferRequest.findById(req.params.id);
    if (!trn) return res.status(404).json({ message: 'Transfer request not found.' });

    let nextStatus = trn.status;
    let detailsLog = '';

    if (decision === 'Recommend') {
      nextStatus = 'Pending Approval';
      detailsLog = 'Manager recommended request.';
    } else if (decision === 'Approve') {
      nextStatus = 'Under HR Review';
      detailsLog = 'Department head approved request.';
    } else if (decision === 'Reject') {
      nextStatus = 'Rejected';
      detailsLog = 'Transfer request rejected.';
    } else if (decision === 'Send Back') {
      nextStatus = 'Sent Back';
      detailsLog = 'Request sent back for revisions.';
    }

    trn.status = nextStatus;
    trn.approvalHistory.push({
      status: decision,
      actorName: req.user.name,
      comments: comments || ''
    });

    trn.auditLog.push({
      action: `DECISION_${decision.toUpperCase()}`,
      actorName: req.user.name,
      details: `${detailsLog} Comments: ${comments}`
    });

    await trn.save();

    // Trigger Notifications
    await Notification.create({
      type: 'reminder',
      title: `Transfer Status: ${nextStatus}`,
      desc: `Transfer request ${trn.transferNumber} status updated to: ${nextStatus}`,
      empId: trn.employeeId
    });

    res.json(trn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/transfers/:id/process
// @desc    HR review, validate and execute final transfer
router.post('/:id/process', protect, async (req, res) => {
  const { newDepartment, newLocation, newManagerId, newCostCenter, newGrade } = req.body;

  try {
    const trn = await TransferRequest.findById(req.params.id);
    if (!trn) return res.status(404).json({ message: 'Transfer request not found.' });

    // Validate HR Role
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR Managers are authorized to finalize transfers.' });
    }

    let newManagerName = '';
    if (newManagerId) {
      const mgr = await Employee.findOne({ id: newManagerId });
      if (mgr) newManagerName = mgr.name;
    }

    // Generate mock letter string
    const letter = `TRANSFER CONFIRMATION LETTER\n\nTransaction ID: ${trn.transferNumber}\n\nDear ${trn.employeeName},\n\nWe are pleased to inform you that your transfer request has been officially approved. Details:\n\n• Effective Date: ${new Date(trn.effectiveDate).toLocaleDateString()}\n• New Department: ${newDepartment}\n• New Location: ${newLocation}\n• New Reporting Manager: ${newManagerName}\n\nPlease coordinate with your new department supervisor for onboarding plans.\n\nSincerely,\nHR Department`;

    trn.newDepartment = newDepartment;
    trn.newLocation = newLocation;
    trn.newManagerId = newManagerId;
    trn.newManagerName = newManagerName;
    trn.newCostCenter = newCostCenter;
    trn.newGrade = newGrade;
    trn.transferLetterUrl = 'transfer_letter_' + trn.employeeId + '.txt';
    trn.status = 'Approved';

    trn.approvalHistory.push({
      status: 'Processed',
      actorName: req.user.name,
      comments: 'Transfer processed and finalized by HR.'
    });

    trn.auditLog.push({
      action: 'PROCESS_TRANSFER',
      actorName: req.user.name,
      details: `Finalized transfer to Dept: ${newDepartment}, Location: ${newLocation}, Manager: ${newManagerName}`
    });

    await trn.save();

    // Update Employee Master Profile
    const emp = await Employee.findOne({ id: trn.employeeId });
    if (emp) {
      const oldDept = emp.dept;
      const oldManagerId = emp.functionalManagerId;

      emp.dept = newDepartment;
      if (newLocation) emp.branch = newLocation;
      if (newManagerId) emp.functionalManagerId = newManagerId;
      if (newCostCenter) emp.costCenter = newCostCenter;
      if (newGrade) emp.grade = newGrade;
      await emp.save();

      // Log to DepartmentTransferHistory
      await DepartmentTransferHistory.create({
        employeeId: trn.employeeId,
        employeeName: trn.employeeName,
        oldDept,
        newDept: newDepartment,
        effectiveDate: trn.effectiveDate,
        reason: trn.transferReason
      });

      // Log to EmployeeReportingHistory
      await EmployeeReportingHistory.create({
        employeeId: trn.employeeId,
        employeeName: trn.employeeName,
        oldManagerId,
        newManagerId,
        effectiveDate: trn.effectiveDate,
        reason: trn.transferReason
      });
    }

    // Notify stakeholders
    await Notification.create({
      type: 'reminder',
      title: 'Transfer Approved',
      desc: `Your transfer to ${newDepartment} has been confirmed. Transfer letter issued.`,
      empId: trn.employeeId
    });

    res.json({
      transfer: trn,
      letter
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/transfers/history
// @desc    Get complete transfers and department/manager change histories
router.get('/history', protect, async (req, res) => {
  try {
    const deptHistory = await DepartmentTransferHistory.find({}).sort({ effectiveDate: -1 });
    const managerHistory = await EmployeeReportingHistory.find({}).sort({ effectiveDate: -1 });

    res.json({
      deptHistory,
      managerHistory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
