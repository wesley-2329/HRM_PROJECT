const express = require('express');
const router = express.Router();
const ApprovalMatrix = require('../models/ApprovalMatrix');
const ApprovalAssignment = require('../models/ApprovalAssignment');
const ApprovalHistory = require('../models/ApprovalHistory');
const ApprovalEscalation = require('../models/ApprovalEscalation');
const ProcessMaster = require('../models/ProcessMaster');
const RoleMaster = require('../models/RoleMaster');
const ApprovalLevelMaster = require('../models/ApprovalLevelMaster');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const OrgAuditLog = require('../models/OrgAuditLog');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// Helper to create audit logs
const logAction = async (req, action, details, oldValues = null, newValues = null) => {
  try {
    await OrgAuditLog.create({
      actorId: req.user.id,
      actorName: req.user.name,
      action,
      details,
      oldValues,
      newValues,
      browser: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      reason: req.body.reason || 'Approval Matrix Operation'
    });
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};

// Approver Resolution Helper
const resolveApprovers = async (requester, roleName) => {
  const approvers = [];
  const cleanRole = roleName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (cleanRole === 'reportingmanager' || cleanRole === 'manager') {
    if (requester.functionalManagerId) approvers.push(requester.functionalManagerId);
    else if (requester.teamLeadId) approvers.push(requester.teamLeadId);
  } else if (cleanRole === 'departmenthead' || cleanRole === 'head') {
    const deptObj = await Department.findOne({ name: requester.dept });
    if (deptObj && deptObj.managerId) {
      approvers.push(deptObj.managerId);
    } else if (deptObj && deptObj.departmentHead) {
      approvers.push(deptObj.departmentHead);
    } else {
      if (requester.functionalManagerId) approvers.push(requester.functionalManagerId);
    }
  } else if (cleanRole === 'hrofficer' || cleanRole === 'hrmanager' || cleanRole === 'hr') {
    if (requester.hrManagerId) {
      approvers.push(requester.hrManagerId);
    } else {
      const hrs = await Employee.find({ role: 'hr' });
      hrs.forEach(h => approvers.push(h.id));
    }
  } else if (cleanRole === 'skipmanager') {
    if (requester.skipManagerId) approvers.push(requester.skipManagerId);
  } else {
    // Look up designations / roles matching the roleName
    const matches = await Employee.find({
      $or: [
        { role: new RegExp('^' + roleName + '$', 'i') },
        { designation: new RegExp('^' + roleName + '$', 'i') }
      ],
      status: 'Approved'
    });
    matches.forEach(m => approvers.push(m.id));
  }

  // Fallback to default HR if empty
  if (approvers.length === 0) {
    const hrs = await Employee.find({ role: 'hr' });
    hrs.forEach(h => approvers.push(h.id));
  }

  return [...new Set(approvers)].filter(id => id && id.trim() !== '');
};

// Check and trigger SLA/Escalation check dynamically
const verifyEscalations = async (io) => {
  try {
    const now = new Date();
    const pendingAssignments = await ApprovalAssignment.find({ status: 'Pending' });

    for (let assign of pendingAssignments) {
      const lvlIdx = assign.currentLevel - 1;
      const activeLvl = assign.levels[lvlIdx];

      if (activeLvl && activeLvl.status === 'Pending' && activeLvl.dueDate && now > activeLvl.dueDate) {
        // SLA breach! Trigger Escalation
        assign.status = 'Escalated';
        activeLvl.status = 'Skipped'; // Skip current level or trigger alert
        await assign.save();

        // Log escalation
        const originalId = activeLvl.assignedApprovers[0] || 'Unknown';
        const requester = await Employee.findOne({ id: assign.requesterId });
        let escToId = requester?.functionalManagerId || requester?.teamLeadId || 'EMP-0001';

        await ApprovalEscalation.create({
          assignmentId: assign._id,
          levelNumber: assign.currentLevel,
          originalApproverId: originalId,
          escalatedToId: escToId,
          reason: `Approver failed to sign off within ${activeLvl.slaDays} days SLA.`
        });

        // Notify escalation
        const notif = await Notification.create({
          type: 'alert',
          title: 'SLA Escalation Triggered',
          desc: `Approval for ${assign.processName} (${assign.requesterName}) has breached SLA and has been escalated.`,
          empId: escToId
        });
        if (io) {
          io.to(escToId).emit('notification', notif);
        }
      }
    }
  } catch (err) {
    console.error('Escalation runner check failed:', err);
  }
};

// ================= MASTER SETUP ENDPOINTS =================
router.get('/masters', protect, async (req, res) => {
  try {
    let processes = await ProcessMaster.find({});
    let roles = await RoleMaster.find({});
    let levels = await ApprovalLevelMaster.find({});

    // Seed defaults if empty
    if (processes.length === 0) {
      processes = await ProcessMaster.insertMany([
        { name: 'Leave Claim', description: 'Employee PTO and sick leave applications' },
        { name: 'Purchase Request', description: 'Requisitions for materials or tools procurement' },
        { name: 'Recruitment Request', description: 'Requisitions for headcounts & hiring' },
        { name: 'Salary Revision', description: 'Promotion or appraisal salary adjustments' },
        { name: 'Transfer', description: 'Employee department or branch transitions' },
        { name: 'Promotion', description: 'Role elevation and rank promotions' }
      ]);
    }
    if (roles.length === 0) {
      roles = await RoleMaster.insertMany([
        { name: 'Reporting Manager', description: 'First level reporting manager' },
        { name: 'Department Head', description: 'Manager / Head of Department' },
        { name: 'HR Officer', description: 'HR Compliance Representative' },
        { name: 'HR Manager', description: 'HR Department Head' },
        { name: 'Finance Lead', description: 'Finance Department Head' },
        { name: 'CEO Office', description: 'Chief Executive Officer' },
        { name: 'Skip Manager', description: 'Manager of Reporting Manager' }
      ]);
    }
    if (levels.length === 0) {
      levels = await ApprovalLevelMaster.insertMany([
        { levelNumber: 1, name: 'Level 1', description: 'Immediate Supervisor Review' },
        { levelNumber: 2, name: 'Level 2', description: 'Department Authority Authorization' },
        { levelNumber: 3, name: 'Level 3', description: 'Final Corporate signoff' },
        { levelNumber: 4, name: 'Level 4', description: 'Executive Signoff' }
      ]);
    }

    res.json({ processes, roles, levels });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= APPROVAL MATRIX CONFIG ROUTES =================

// List configurations
router.get('/matrices', protect, async (req, res) => {
  try {
    const list = await ApprovalMatrix.find({}).sort({ updatedAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new configuration matrix
router.post('/matrices', protect, adminOnly, async (req, res) => {
  const { moduleName, processName, department, levels, effectiveDate } = req.body;

  try {
    // If active matrix already exists for the same process & dept, mark it inactive first
    await ApprovalMatrix.updateMany(
      { processName, department, status: 'Active' },
      { status: 'Inactive' }
    );

    const matrix = await ApprovalMatrix.create({
      moduleName,
      processName,
      department,
      levels,
      effectiveDate: effectiveDate || new Date(),
      status: 'Active',
      version: 1,
      createdBy: req.user.name,
      updatedBy: req.user.name
    });

    await logAction(req, 'CREATE_MATRIX', `Created Approval Matrix for ${processName} (${department})`, null, matrix);
    res.status(201).json(matrix);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update matrix config (Increments version & archives details in history log)
router.put('/matrices/:id', protect, adminOnly, async (req, res) => {
  try {
    const matrix = await ApprovalMatrix.findById(req.params.id);
    if (!matrix) return res.status(404).json({ message: 'Matrix not found' });

    const oldValues = matrix.toObject();
    
    // Add current details to history archive log
    matrix.history.push({
      version: matrix.version,
      updatedBy: matrix.updatedBy,
      updatedAt: matrix.updatedAt,
      changeSummary: req.body.changeSummary || 'Configuration modified',
      oldValues: { levels: oldValues.levels, effectiveDate: oldValues.effectiveDate },
      newValues: { levels: req.body.levels, effectiveDate: req.body.effectiveDate }
    });

    matrix.levels = req.body.levels;
    matrix.effectiveDate = req.body.effectiveDate || matrix.effectiveDate;
    matrix.version += 1;
    matrix.updatedBy = req.user.name;
    matrix.approvedBy = req.user.name; // CEO/Manager approved

    await matrix.save();
    await logAction(req, 'UPDATE_MATRIX', `Updated Matrix configurations to version v${matrix.version} for ${matrix.processName}`, oldValues, matrix);

    res.json(matrix);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle configuration status
router.put('/matrices/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const matrix = await ApprovalMatrix.findById(req.params.id);
    if (!matrix) return res.status(404).json({ message: 'Matrix not found' });

    const oldStatus = matrix.status;
    const newStatus = oldStatus === 'Active' ? 'Inactive' : 'Active';

    // If making active, disable any other active matrices for same process & dept
    if (newStatus === 'Active') {
      await ApprovalMatrix.updateMany(
        { processName: matrix.processName, department: matrix.department, _id: { $ne: matrix._id } },
        { status: 'Inactive' }
      );
    }

    matrix.status = newStatus;
    matrix.updatedBy = req.user.name;
    await matrix.save();

    await logAction(req, 'TOGGLE_MATRIX_STATUS', `Approval matrix status of ${matrix.processName} changed from ${oldStatus} to ${newStatus}`, { status: oldStatus }, { status: newStatus });
    res.json(matrix);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete configuration matrix
router.delete('/matrices/:id', protect, adminOnly, async (req, res) => {
  try {
    const matrix = await ApprovalMatrix.findById(req.params.id);
    if (!matrix) return res.status(404).json({ message: 'Matrix config not found' });

    await ApprovalMatrix.findByIdAndDelete(req.params.id);
    await logAction(req, 'DELETE_MATRIX', `Deleted configuration matrix for ${matrix.processName} (${matrix.department})`);
    res.json({ message: 'Matrix deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ACTIVE WORKFLOW ASSIGNMENTS & TRANSACTIONS =================

// Get active assignments
router.get('/assignments', protect, async (req, res) => {
  try {
    // Run SLA validations
    await verifyEscalations(req.io);

    let query = {};
    if (req.user.role !== 'hr') {
      // Employees see requests they initiated or are assigned to approve
      query.$or = [
        { requesterId: req.user.id },
        { 'levels.assignedApprovers': req.user.id }
      ];
    }

    const list = await ApprovalAssignment.find(query).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/assignments/inbox', protect, async (req, res) => {
  try {
    await verifyEscalations(req.io);

    const allAssignments = await ApprovalAssignment.find({ status: { $in: ['Pending', 'Escalated'] } });
    
    const inbox = allAssignments.filter(assign => {
      const lvlIdx = assign.currentLevel - 1;
      const activeLvl = assign.levels[lvlIdx];
      return activeLvl && 
             activeLvl.status === 'Pending' && 
             activeLvl.assignedApprovers.includes(req.user.id);
    });

    const inboxWithDetails = [];
    for (let assign of inbox) {
      let details = null;
      if (assign.transactionSource === 'Leave') {
        const Leave = require('../models/Leave');
        details = await Leave.findById(assign.transactionId);
      }
      inboxWithDetails.push({
        ...assign.toObject(),
        details
      });
    }

    res.json(inboxWithDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit approval decision (Approve/Reject)
router.put('/assignments/:id/action', protect, async (req, res) => {
  const { action, comments } = req.body; // 'Approved' or 'Rejected'

  if (!['Approved', 'Rejected'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action value' });
  }

  try {
    const assign = await ApprovalAssignment.findById(req.params.id);
    if (!assign) return res.status(404).json({ message: 'Workflow assignment not found' });

    const lvlIdx = assign.currentLevel - 1;
    const activeLvl = assign.levels[lvlIdx];

    if (!activeLvl || activeLvl.status !== 'Pending') {
      return res.status(400).json({ message: 'Active approval level mismatch' });
    }

    // Verify current user is authorized to approve
    if (!activeLvl.assignedApprovers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to approve this workflow level' });
    }

    const oldStatus = assign.status;

    // Log the approval action
    activeLvl.status = action;
    activeLvl.approvedBy = req.user.id;
    activeLvl.decisionDate = new Date();
    activeLvl.comments = comments || '';

    await ApprovalHistory.create({
      assignmentId: assign._id,
      transactionId: assign.transactionId,
      processName: assign.processName,
      levelNumber: assign.currentLevel,
      approverId: req.user.id,
      approverName: req.user.name,
      approverRole: activeLvl.approverRole,
      action,
      comments: comments || '',
      oldStatus: oldStatus,
      newStatus: action === 'Rejected' ? 'Rejected' : (assign.currentLevel === assign.levels.length ? 'Approved' : 'Pending')
    });

    if (action === 'Rejected') {
      assign.status = 'Rejected';
      await assign.save();

      // Update source transaction to Rejected
      if (assign.transactionSource === 'Leave') {
        const Leave = require('../models/Leave');
        await Leave.findByIdAndUpdate(assign.transactionId, { status: 'Rejected' });
      }

      // Notify requester
      const notif = await Notification.create({
        type: 'leave',
        title: `${assign.processName} Rejected`,
        desc: `Your ${assign.processName} request was rejected by ${req.user.name} at Level ${assign.currentLevel}.`,
        empId: assign.requesterId
      });
      req.io.to(assign.requesterId).emit('notification', notif);

    } else {
      // Approved
      if (assign.currentLevel === assign.levels.length) {
        // Ultimate approval! All levels cleared
        assign.status = 'Approved';
        await assign.save();

        // Update source transaction to Approved
        if (assign.transactionSource === 'Leave') {
          const Leave = require('../models/Leave');
          await Leave.findByIdAndUpdate(assign.transactionId, { status: 'Approved' });
        }

        // Notify requester
        const notif = await Notification.create({
          type: 'leave',
          title: `${assign.processName} Approved`,
          desc: `Congratulations! Your ${assign.processName} request has been fully approved.`,
          empId: assign.requesterId
        });
        req.io.to(assign.requesterId).emit('notification', notif);

      } else {
        // Move to next level
        assign.currentLevel += 1;
        const nextLvl = assign.levels[assign.currentLevel - 1];
        nextLvl.status = 'Pending';
        
        // SLA Dates
        const due = new Date();
        due.setDate(due.getDate() + (nextLvl.slaDays || 3));
        nextLvl.dueDate = due;

        await assign.save();

        // Notify next level approvers
        for (let appId of nextLvl.assignedApprovers) {
          const notif = await Notification.create({
            type: 'leave',
            title: `Approval Required: Level ${assign.currentLevel}`,
            desc: `Request for ${assign.processName} submitted by ${assign.requesterName} is pending your approval.`,
            empId: appId
          });
          req.io.to(appId).emit('notification', notif);
        }
      }
    }

    res.json(assign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= AUDIT LOGS & REPORTS ENDPOINTS =================

// Turnaround time & history reports
router.get('/reports', protect, async (req, res) => {
  try {
    const list = await ApprovalAssignment.find({});
    const histories = await ApprovalHistory.find({}).sort({ createdAt: -1 });
    const escalations = await ApprovalEscalation.find({}).sort({ createdAt: -1 });

    // Aggregate turnaround details
    const totalRequests = list.length;
    const pendingCount = list.filter(a => a.status === 'Pending' || a.status === 'Escalated').length;
    const approvedCount = list.filter(a => a.status === 'Approved').length;
    const rejectedCount = list.filter(a => a.status === 'Rejected').length;
    
    // SLA check: calculate overdue
    const overdueCount = list.filter(assign => {
      if (assign.status !== 'Pending') return false;
      const actLvl = assign.levels[assign.currentLevel - 1];
      return actLvl && actLvl.dueDate && new Date() > new Date(actLvl.dueDate);
    }).length;

    // Turnaround times logic
    let turnaroundTimes = [];
    const completedAssignments = list.filter(a => a.status === 'Approved' || a.status === 'Rejected');
    for (let assign of completedAssignments) {
      const elapsedMs = new Date(assign.updatedAt) - new Date(assign.createdAt);
      const elapsedDays = Math.round(elapsedMs / (1000 * 60 * 60 * 24) * 10) / 10;
      turnaroundTimes.push({
        id: assign._id,
        processName: assign.processName,
        requesterName: assign.requesterName,
        status: assign.status,
        durationDays: elapsedDays || 0.1
      });
    }

    res.json({
      summary: {
        totalRequests,
        pendingCount,
        approvedCount,
        rejectedCount,
        escalationsCount: escalations.length,
        overdueCount
      },
      turnaroundTimes,
      histories,
      escalations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
