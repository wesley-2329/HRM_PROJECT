const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const EmployeeProbation = require('../models/EmployeeProbation');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + parseInt(days));
  return result;
};

// @route   GET /api/probation
// @desc    Get all probation records and dashboard metrics
router.get('/', protect, async (req, res) => {
  try {
    const list = await EmployeeProbation.find({}).sort({ createdAt: -1 });

    const total = list.length;
    const underProbation = list.filter(p => p.status === 'Under Probation').length;
    const reviewPending = list.filter(p => p.status === 'Review Pending').length;
    const confirmed = list.filter(p => p.status === 'Confirmed').length;
    const extended = list.filter(p => p.status === 'Extended').length;
    const separated = list.filter(p => p.status === 'Separated').length;

    const now = new Date();
    const overdueReviews = list.filter(p => p.status === 'Under Probation' && p.probationEndDate && new Date(p.probationEndDate) < now).length;

    res.json({
      data: list,
      summary: {
        total,
        underProbation,
        reviewPending,
        confirmed,
        extended,
        separated,
        overdueReviews
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/probation/assign
// @desc    Assign probation period to an employee
router.post('/assign', protect, async (req, res) => {
  const { employeeId, employeeCategory, probationDuration, kpis, reportingManagerId } = req.body;

  if (!employeeId || !probationDuration) {
    return res.status(400).json({ message: 'Employee ID and probation duration are mandatory.' });
  }

  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });

    // Fetch reporting manager details
    let reportingManagerName = 'Manager';
    if (reportingManagerId) {
      const mgr = await Employee.findOne({ id: reportingManagerId });
      if (mgr) reportingManagerName = mgr.name;
    }

    const joiningDate = emp.joined ? new Date(emp.joined) : new Date();
    const endDate = addDays(joiningDate, probationDuration);

    // Business Rule Check: Probation mandatory for selected employee categories
    if (!['Probationer', 'Trainee', 'Contract'].includes(employeeCategory)) {
      return res.status(400).json({ message: 'Probation assignment is only applicable for Probationers, Trainees, or Contract staff.' });
    }

    // Check if probation record already exists for this employee
    let prob = await EmployeeProbation.findOne({ employeeId });
    if (prob) {
      // Overwrite or update
      prob.employeeCategory = employeeCategory;
      prob.probationDuration = probationDuration;
      prob.probationEndDate = endDate;
      prob.reportingManagerId = reportingManagerId || prob.reportingManagerId;
      prob.reportingManagerName = reportingManagerName || prob.reportingManagerName;
      prob.kpis = kpis || [];
      prob.status = 'Under Probation';
    } else {
      prob = new EmployeeProbation({
        employeeId,
        employeeName: emp.name,
        employeeCode: emp.id,
        department: emp.dept,
        designation: emp.designation || 'Trainee',
        joiningDate,
        employeeCategory,
        probationDuration,
        probationEndDate: endDate,
        reportingManagerId,
        reportingManagerName,
        status: 'Under Probation',
        kpis: kpis || []
      });
    }

    prob.lifecycleHistory.push({
      status: 'Under Probation',
      updatedBy: req.user.name,
      notes: `Probation of ${probationDuration} days assigned. Target end date: ${endDate.toLocaleDateString()}`
    });

    prob.auditLog.push({
      action: 'ASSIGN_PROBATION',
      actorName: req.user.name,
      details: `Assigned probation duration ${probationDuration} days to employee ${emp.name}`
    });

    await prob.save();

    // Update Employee Main Record
    emp.employeeCategory = employeeCategory;
    emp.probationStatus = 'Under Probation';
    await emp.save();

    // Notify Employee & Manager
    await Notification.create({
      type: 'reminder',
      title: 'Probation Period Assigned',
      desc: `You are placed under ${probationDuration} days probation. Target end date: ${endDate.toLocaleDateString()}`,
      empId: employeeId
    });

    if (reportingManagerId) {
      await Notification.create({
        type: 'alert',
        title: 'Probation Review Assigned',
        desc: `You are mapped as the reporting manager for ${emp.name}'s probation review.`,
        empId: reportingManagerId
      });
    }

    res.status(201).json(prob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/probation/:id/review
// @desc    Submit probation review evaluation (Reporting Manager only)
router.put('/:id/review', protect, async (req, res) => {
  const { goalAchievement, attendanceReview, behaviorReview, managerComments, recommendation } = req.body;

  try {
    const prob = await EmployeeProbation.findById(req.params.id);
    if (!prob) return res.status(404).json({ message: 'Probation record not found.' });

    // Update Review sub-document
    prob.review = {
      goalAchievement,
      attendanceReview,
      behaviorReview,
      managerComments,
      recommendation,
      reviewDate: new Date(),
      completedBy: req.user.name
    };

    prob.status = 'Review Pending';
    prob.lifecycleHistory.push({
      status: 'Review Pending',
      updatedBy: req.user.name,
      notes: `Evaluation review submitted by manager ${req.user.name}. Recommendation: ${recommendation}`
    });

    prob.auditLog.push({
      action: 'SUBMIT_REVIEW',
      actorName: req.user.name,
      details: `Submitted evaluation review for employee ${prob.employeeName}`
    });

    await prob.save();

    // Update Employee status
    await Employee.updateOne({ id: prob.employeeId }, { probationStatus: 'Review Pending' });

    // Notify HR
    await Notification.create({
      type: 'alert',
      title: 'Probation Review Pending Decision',
      desc: `Probation review evaluation submitted for ${prob.employeeName} pending final HR decision.`,
      empId: '' // HR / Admin
    });

    res.json(prob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/probation/:id/decision
// @desc    HR process probation confirmation/extension decision
router.put('/:id/decision', protect, async (req, res) => {
  const { action, remarks, effectiveDate, extensionDays } = req.body; // 'Confirm' | 'Extend Probation' | 'Transfer' | 'Separation'

  try {
    const prob = await EmployeeProbation.findById(req.params.id);
    if (!prob) return res.status(404).json({ message: 'Probation record not found.' });

    // Business Rule Check: Review must be completed before confirmation decision
    if (!prob.review || !prob.review.recommendation) {
      return res.status(400).json({ message: 'Probation review must be completed before processing a final decision.' });
    }

    // HR Authorization Check
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR Managers are authorized to finalize probation decisions.' });
    }

    let nextStatus = 'Confirmed';
    let employeeStatusText = 'Confirmed';
    let empCategory = 'Permanent';
    let letterText = '';

    if (action === 'Confirm') {
      nextStatus = 'Confirmed';
      employeeStatusText = 'Confirmed';
      empCategory = 'Permanent';
      letterText = `CONFIRMATION LETTER\n\nDear ${prob.employeeName},\n\nWe are pleased to inform you that your performance during the probation period has been found satisfactory. You are hereby confirmed as a Permanent employee with designation ${prob.designation} effective ${new Date(effectiveDate || Date.now()).toLocaleDateString()}.\n\nSincerely,\nHR Department`;
    } else if (action === 'Extend Probation') {
      // Business Rule: Extension cannot exceed limit
      if (extensionDays > 180) {
        return res.status(400).json({ message: 'Probation extension duration cannot exceed 180 days limit.' });
      }
      nextStatus = 'Extended';
      employeeStatusText = 'Extended';
      empCategory = prob.employeeCategory;
      prob.probationEndDate = addDays(prob.probationEndDate, extensionDays);
      letterText = `PROBATION EXTENSION LETTER\n\nDear ${prob.employeeName},\n\nThis is to inform you that your probation period has been extended by ${extensionDays} days. Your new probation end date is ${prob.probationEndDate.toLocaleDateString()}.\n\nSincerely,\nHR Department`;
    } else if (action === 'Separation') {
      nextStatus = 'Separated';
      employeeStatusText = 'Separated';
      empCategory = 'Consultant';
      letterText = `SEPARATION ADVISORY LETTER\n\nDear ${prob.employeeName},\n\nWe regret to inform you that your services are being terminated as a result of unsatisfactory probation review evaluation.\n\nSincerely,\nHR Department`;
    } else if (action === 'Transfer') {
      nextStatus = 'Confirmed';
      employeeStatusText = 'Confirmed';
      empCategory = 'Permanent';
      letterText = `TRANSFER & CONFIRMATION LETTER\n\nDear ${prob.employeeName},\n\nYou are hereby confirmed and transferred to the appropriate department.\n\nSincerely,\nHR Department`;
    }

    prob.decision = {
      action,
      remarks,
      effectiveDate: effectiveDate || new Date(),
      approvedBy: req.user.name,
      letterUrl: 'generated_letter_' + prob.employeeCode + '.txt',
      extensionDays: extensionDays || 0
    };

    prob.status = nextStatus;

    prob.lifecycleHistory.push({
      status: nextStatus,
      updatedBy: req.user.name,
      notes: `Decision processed: ${action}. Remarks: ${remarks}`
    });

    prob.auditLog.push({
      action: 'PROCESS_DECISION',
      actorName: req.user.name,
      details: `Processed final decision ${action} for employee ${prob.employeeName}`
    });

    await prob.save();

    // Update Employee model
    await Employee.updateOne({ id: prob.employeeId }, {
      employeeCategory: empCategory,
      probationStatus: employeeStatusText
    });

    // Notify Employee
    await Notification.create({
      type: 'reminder',
      title: `Probation Status: ${action}`,
      desc: `Your probation has been updated to: ${action}. Confirmation letter generated.`,
      empId: prob.employeeId
    });

    res.json({
      probation: prob,
      letter: letterText
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/probation/reports
// @desc    Get reports data for probation
router.get('/reports', protect, async (req, res) => {
  try {
    const list = await EmployeeProbation.find({});
    const now = new Date();

    const underProbationList = list.filter(p => p.status === 'Under Probation');
    
    const upcomingConfirmationList = list.filter(p => {
      if (p.status !== 'Under Probation') return false;
      const diffMs = new Date(p.probationEndDate) - now;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30; // within next 30 days
    });

    const overdueList = list.filter(p => p.status === 'Under Probation' && p.probationEndDate && new Date(p.probationEndDate) < now);
    const extendedList = list.filter(p => p.status === 'Extended');

    // Department Confirmation Summary
    const deptStats = {};
    list.forEach(p => {
      if (!deptStats[p.department]) {
        deptStats[p.department] = { total: 0, confirmed: 0 };
      }
      deptStats[p.department].total += 1;
      if (p.status === 'Confirmed') {
        deptStats[p.department].confirmed += 1;
      }
    });

    const deptReport = Object.keys(deptStats).map(d => ({
      department: d,
      total: deptStats[d].total,
      confirmed: deptStats[d].confirmed,
      rate: Math.round(deptStats[d].confirmed / deptStats[d].total * 100) || 0
    }));

    res.json({
      underProbationList,
      upcomingConfirmationList,
      overdueList,
      extendedList,
      deptReport
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/probation/:id/email-letter
// @desc    Email confirmation/extension letter to employee
router.post('/:id/email-letter', protect, async (req, res) => {
  try {
    const prob = await EmployeeProbation.findById(req.params.id);
    if (!prob) return res.status(404).json({ message: 'Probation record not found.' });

    // In a real system, we would use nodemailer. We will mock it:
    console.log(`Emailing letter to ${prob.employeeName} at ${prob.employeeCode}@company.com`);
    
    prob.lifecycleHistory.push({
      status: prob.status,
      updatedBy: req.user.name,
      notes: `Sent Confirmation Letter via Email to employee.`
    });
    await prob.save();

    res.json({ message: `Confirmation Letter successfully emailed to ${prob.employeeName}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
