const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/leaves
// @desc    Get all leaves (HR sees all, Employee sees own)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let leaves;
    if (req.user.role === 'hr') {
      leaves = await Leave.find({}).sort({ createdAt: -1 });
    } else {
      leaves = await Leave.find({ empId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/leaves
// @desc    Apply for leave
// @access  Private
router.post('/', protect, async (req, res) => {
  const { type, start, end, reason } = req.body;

  try {
    const leave = await Leave.create({
      empId: req.user.id,
      empName: req.user.name,
      type,
      start,
      end,
      reason,
      status: 'Pending'
    });

    // Create notification & route via Approval Matrix if configured
    const ApprovalMatrix = require('../models/ApprovalMatrix');
    const ApprovalAssignment = require('../models/ApprovalAssignment');
    const Employee = require('../models/Employee');
    const Department = require('../models/Department');

    // Helper to resolve approver users
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
        const matches = await Employee.find({
          $or: [
            { role: new RegExp('^' + roleName + '$', 'i') },
            { designation: new RegExp('^' + roleName + '$', 'i') }
          ],
          status: 'Approved'
        });
        matches.forEach(m => approvers.push(m.id));
      }

      if (approvers.length === 0) {
        const hrs = await Employee.find({ role: 'hr' });
        hrs.forEach(h => approvers.push(h.id));
      }

      return [...new Set(approvers)].filter(id => id && id.trim() !== '');
    };

    // Check for active Approval Matrix for "Leave Claim"
    const activeMatrix = await ApprovalMatrix.findOne({
      processName: 'Leave Claim',
      status: 'Active',
      $or: [
        { department: req.user.dept },
        { department: 'All' }
      ]
    }).sort({ department: 1 }); // Prefer specific dept match over 'All'

    if (activeMatrix && activeMatrix.levels.length > 0) {
      const requester = await Employee.findOne({ id: req.user.id });
      const resolvedLevels = [];

      for (let lvl of activeMatrix.levels) {
        const approverIds = await resolveApprovers(requester, lvl.approverRole);
        const due = new Date();
        due.setDate(due.getDate() + (lvl.slaDays || 3));

        resolvedLevels.push({
          levelNumber: lvl.levelNumber,
          approverRole: lvl.approverRole,
          approvalType: lvl.approvalType || 'Single',
          assignedApprovers: approverIds,
          status: 'Pending',
          slaDays: lvl.slaDays || 3,
          dueDate: lvl.levelNumber === 1 ? due : null
        });
      }

      // Create workflow assignment
      await ApprovalAssignment.create({
        transactionId: leave._id,
        transactionSource: 'Leave',
        processName: 'Leave Claim',
        requesterId: req.user.id,
        requesterName: req.user.name,
        requesterDept: req.user.dept,
        requesterRole: req.user.role,
        levels: resolvedLevels,
        currentLevel: 1,
        status: 'Pending',
        matrixVersion: activeMatrix.version,
        matrixId: activeMatrix._id
      });

      // Send notifications to Level 1 approvers
      const level1 = resolvedLevels[0];
      const Notification = require('../models/Notification');
      for (let appId of level1.assignedApprovers) {
        const notif = await Notification.create({
          type: 'leave',
          title: 'Approval Required: Level 1',
          desc: `Leave request applied by ${req.user.name} requires your authorization.`,
          empId: appId
        });
        req.io.to(appId).emit('notification', notif);
      }
    } else {
      // Fallback: Create notification for HR
      const Notification = require('../models/Notification');
      const notif = await Notification.create({
        type: 'leave',
        title: 'New Leave Request',
        desc: `${req.user.name} applied for ${type} leave from ${start} to ${end}.`,
        empId: 'hr'
      });

      // Emit socket notification to HR room
      req.io.to('hr').emit('notification', notif);
    }

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/leaves/:id
// @desc    Approve or Reject leave request
// @access  Private/HR only
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    await leave.save();

    // Create notification for employee
    const Notification = require('../models/Notification');
    const notif = await Notification.create({
      type: 'leave',
      title: `Leave request ${status}`,
      desc: `Your leave request for ${leave.type} has been ${status.toLowerCase()}.`,
      empId: leave.empId
    });

    // Emit socket notification to employee room
    req.io.to(leave.empId).emit('notification', notif);

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Cancel/delete a pending leave request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if owner
    if (leave.empId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only delete pending leave applications' });
    }

    await Leave.deleteOne({ _id: req.params.id });
    res.json({ message: 'Leave application cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
