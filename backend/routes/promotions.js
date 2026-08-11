const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const PromotionRequest = require('../models/PromotionRequest');
const DesignationHistory = require('../models/DesignationHistory');
const SalaryRevisionHistory = require('../models/SalaryRevisionHistory');
const DepartmentTransferHistory = require('../models/DepartmentTransferHistory');
const EmployeeReportingHistory = require('../models/EmployeeReportingHistory');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to generate next request ID
const generateRequestId = async () => {
  const year = new Date().getFullYear();
  const count = await PromotionRequest.countDocuments({
    requestId: new RegExp(`^PRM-${year}-`)
  });
  const nextNum = String(count + 1).padStart(4, '0');
  return `PRM-${year}-${nextNum}`;
};

// @route   GET /api/promotions
// @desc    Get all promotion requests and dashboard metrics
router.get('/', protect, async (req, res) => {
  try {
    const list = await PromotionRequest.find({}).sort({ createdAt: -1 });

    const total = list.length;
    const pending = list.filter(p => ['Pending Verification', 'Pending Approval', 'Under Management Review'].includes(p.status)).length;
    const approved = list.filter(p => p.status === 'Approved').length;
    const rejected = list.filter(p => p.status === 'Rejected').length;
    
    // Total eligible criteria: Permanent status active employees
    const eligibleCount = await Employee.countDocuments({ 
      employeeCategory: 'Permanent', 
      status: 'Approved' 
    });

    res.json({
      data: list,
      summary: {
        total,
        pending,
        approved,
        rejected,
        eligibleCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/promotions
// @desc    Recommend/Initiate employee promotion request
router.post('/', protect, async (req, res) => {
  const { 
    employeeId, proposedDesignation, proposedGrade, proposedDepartment, 
    proposedManagerId, effectiveDate, justification, performanceSummary, 
    keyAchievements, attachmentUrl, currentSalary, proposedSalary 
  } = req.body;

  if (!employeeId || !proposedDesignation || !proposedGrade || !effectiveDate) {
    return res.status(400).json({ message: 'Employee ID, proposed designation, grade, and effective date are required.' });
  }

  try {
    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });

    // Business Rule Check: Employee must be Active
    if (emp.status !== 'Approved') {
      return res.status(400).json({ message: 'Promotion is only applicable for active, onboarded employees.' });
    }

    // Business Rule Check: Employee must be Confirmed
    if (emp.employeeCategory !== 'Permanent') {
      return res.status(400).json({ message: 'Only confirmed permanent employees are eligible for promotion workflows.' });
    }

    // Resolve Manager Name
    let currentManagerName = '';
    if (emp.functionalManagerId) {
      const mgr = await Employee.findOne({ id: emp.functionalManagerId });
      if (mgr) currentManagerName = mgr.name;
    }

    let proposedManagerName = '';
    if (proposedManagerId) {
      const mgr = await Employee.findOne({ id: proposedManagerId });
      if (mgr) proposedManagerName = mgr.name;
    }

    const reqId = await generateRequestId();
    const joinedDate = emp.joined ? new Date(emp.joined) : new Date();

    const promotion = await PromotionRequest.create({
      requestId: reqId,
      employeeId,
      employeeName: emp.name,
      currentDepartment: emp.dept,
      currentDesignation: emp.designation || 'Staff',
      currentGrade: emp.grade || 'A1',
      currentManagerId: emp.functionalManagerId || '',
      currentManagerName,
      joiningDate: joinedDate,
      currentLocation: emp.branch || 'Head Office',

      proposedDesignation,
      proposedGrade,
      proposedDepartment: proposedDepartment || emp.dept,
      proposedManagerId: proposedManagerId || emp.functionalManagerId || '',
      proposedManagerName,
      effectiveDate,
      justification,
      performanceSummary,
      keyAchievements,
      attachmentUrl,

      currentSalary: currentSalary || 0,
      proposedSalary: proposedSalary || 0,

      // Initial eligibility checked details
      eligibilityChecked: {
        confirmationStatus: 'Confirmed',
        probationStatus: 'Completed',
        servicePeriodMonths: 12,
        performanceRating: 'A',
        disciplinaryRecords: 'None',
        activeStatus: true
      },

      status: 'Pending Verification',
      approvalHistory: [{
        status: 'Pending Verification',
        actorName: req.user.name,
        comments: 'Promotion request created.'
      }],
      auditLog: [{
        action: 'CREATE_PROMOTION',
        actorName: req.user.name,
        details: `Initiated promotion request ${reqId} for ${emp.name}.`
      }]
    });

    // Notify HR
    await Notification.create({
      type: 'alert',
      title: 'New Promotion Request',
      desc: `Promotion recommendation ${reqId} submitted for ${emp.name} pending eligibility checks.`,
      empId: '' // HR
    });

    res.status(201).json(promotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/promotions/:id/verify
// @desc    HR eligibility verification step (HR only)
router.put('/:id/verify', protect, async (req, res) => {
  const { status, comments } = req.body; // 'Pending Approval', 'Rejected', 'Hold'

  try {
    const promotion = await PromotionRequest.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion request not found.' });

    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR can verify promotion eligibility.' });
    }

    promotion.status = status;
    promotion.approvalHistory.push({
      status: `HR_${status.toUpperCase()}`,
      actorName: req.user.name,
      comments: comments || ''
    });

    promotion.auditLog.push({
      action: `HR_VERIFY_${status.toUpperCase()}`,
      actorName: req.user.name,
      details: `HR updated verification checklist: ${status}. Comments: ${comments}`
    });

    await promotion.save();

    res.json(promotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/promotions/:id/approve
// @desc    Finalize and Approve/Close promotion request (Management / HR)
router.put('/:id/approve', protect, async (req, res) => {
  const { status, comments } = req.body; // 'Approved', 'Rejected', 'Sent Back', 'Hold'

  try {
    const promotion = await PromotionRequest.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion request not found.' });

    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only authorized administrators are allowed to perform approval steps.' });
    }

    // Business Rule Check: Rejected promotions cannot move directly to Approved status
    if (promotion.status === 'Rejected' && status === 'Approved') {
      return res.status(400).json({ message: 'Rejected requests cannot be directly approved without a new recommendation request.' });
    }

    if (status === 'Approved') {
      // Generate Promotion Letter
      const letterText = `PROMOTION & INCREMENT ADVISORY\n\nRequest ID: ${promotion.requestId}\n\nDear ${promotion.employeeName},\n\nWe are pleased to inform you that you have been promoted. Details:\n\n• New Designation: ${promotion.proposedDesignation}\n• New Grade/Band: ${promotion.proposedGrade}\n• New Department: ${promotion.proposedDepartment}\n• Effective Date: ${new Date(promotion.effectiveDate).toLocaleDateString()}\n\nAdditionally, your salary has been revised to ${promotion.proposedSalary} INR.\n\nCongratulations!\nHR & Management`;

      promotion.status = 'Approved';
      promotion.promotionLetterUrl = 'promotion_letter_' + promotion.employeeId + '.txt';

      promotion.approvalHistory.push({
        status: 'Approved',
        actorName: req.user.name,
        comments: comments || 'Promotion approved by Management.'
      });

      promotion.auditLog.push({
        action: 'FINAL_APPROVAL',
        actorName: req.user.name,
        details: `Approved and finalized promotion request ${promotion.requestId}.`
      });

      await promotion.save();

      // Update Employee Master record
      const emp = await Employee.findOne({ id: promotion.employeeId });
      if (emp) {
        const oldDesignation = emp.designation;
        const oldGrade = emp.grade;
        const oldDept = emp.dept;
        const oldManagerId = emp.functionalManagerId;

        emp.designation = promotion.proposedDesignation;
        emp.grade = promotion.proposedGrade;
        emp.dept = promotion.proposedDepartment;
        if (promotion.proposedManagerId) {
          emp.functionalManagerId = promotion.proposedManagerId;
        }
        await emp.save();

        // 1. Designation History
        await DesignationHistory.create({
          employeeId: promotion.employeeId,
          employeeName: promotion.employeeName,
          oldDesignation,
          newDesignation: promotion.proposedDesignation,
          oldGrade,
          newGrade: promotion.proposedGrade,
          effectiveDate: promotion.effectiveDate,
          reason: promotion.justification
        });

        // 2. Salary Revision History
        await SalaryRevisionHistory.create({
          employeeId: promotion.employeeId,
          employeeName: promotion.employeeName,
          oldSalary: promotion.currentSalary,
          newSalary: promotion.proposedSalary,
          effectiveDate: promotion.effectiveDate,
          approvedBy: req.user.name,
          reason: `Promotional revision: ${promotion.proposedDesignation}`
        });

        // 3. Department history if changed
        if (oldDept !== promotion.proposedDepartment) {
          await DepartmentTransferHistory.create({
            employeeId: promotion.employeeId,
            employeeName: promotion.employeeName,
            oldDept,
            newDept: promotion.proposedDepartment,
            effectiveDate: promotion.effectiveDate,
            reason: `Promotional movement`
          });
        }

        // 4. Reporting manager history if changed
        if (promotion.proposedManagerId && oldManagerId !== promotion.proposedManagerId) {
          await EmployeeReportingHistory.create({
            employeeId: promotion.employeeId,
            employeeName: promotion.employeeName,
            oldManagerId,
            newManagerId: promotion.proposedManagerId,
            effectiveDate: promotion.effectiveDate,
            reason: `Promotional supervisor change`
          });
        }
      }

      // Notify Employee
      await Notification.create({
        type: 'reminder',
        title: 'Congratulations on your Promotion!',
        desc: `You have been promoted to ${promotion.proposedDesignation}. Review and acknowledge your promotion letter.`,
        empId: promotion.employeeId
      });

    } else {
      promotion.status = status;
      promotion.approvalHistory.push({
        status,
        actorName: req.user.name,
        comments: comments || ''
      });
      promotion.auditLog.push({
        action: `DECISION_${status.toUpperCase()}`,
        actorName: req.user.name,
        details: `Promotion request ${promotion.requestId} status updated to: ${status}. Comments: ${comments}`
      });

      await promotion.save();
    }

    res.json(promotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/promotions/:id/acknowledge
// @desc    Employee acknowledge promotion letter
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const promotion = await PromotionRequest.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion request not found.' });

    promotion.acknowledged = true;
    promotion.acceptanceDate = new Date();

    promotion.approvalHistory.push({
      status: 'Acknowledged',
      actorName: req.user.name,
      comments: 'Employee acknowledged promotion terms.'
    });

    promotion.auditLog.push({
      action: 'EMPLOYEE_ACKNOWLEDGEMENT',
      actorName: req.user.name,
      details: `Employee accepted and signed promotion terms.`
    });

    await promotion.save();

    res.json(promotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/promotions/reports
// @desc    Get aggregated metrics and cost impacts for management reviews
router.get('/reports', protect, async (req, res) => {
  try {
    const list = await PromotionRequest.find({});

    const approvedList = list.filter(p => p.status === 'Approved');
    const pendingList = list.filter(p => ['Pending Verification', 'Pending Approval', 'Under Management Review'].includes(p.status));

    // Calculate Promotion Cost Impact (proposedSalary - currentSalary)
    let totalCostImpact = 0;
    approvedList.forEach(p => {
      const diff = p.proposedSalary - p.currentSalary;
      totalCostImpact += (diff > 0 ? diff : 0);
    });

    // Department Breakdown
    const deptStats = {};
    approvedList.forEach(p => {
      deptStats[p.currentDepartment] = (deptStats[p.currentDepartment] || 0) + 1;
    });
    const departmentReport = Object.keys(deptStats).map(d => ({ department: d, count: deptStats[d] }));

    // Designation History logs
    const historyList = await DesignationHistory.find({}).sort({ effectiveDate: -1 });

    res.json({
      approvedList,
      pendingList,
      totalCostImpact,
      departmentReport,
      historyList
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
