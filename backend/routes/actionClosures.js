const express = require('express');
const router = express.Router();
const ActionClosureTracker = require('../models/ActionClosureTracker');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to generate next action ID
const generateActionId = async () => {
  const year = new Date().getFullYear();
  const count = await ActionClosureTracker.countDocuments({
    observationId: new RegExp(`^ACT-${year}-`)
  });
  const nextNum = String(count + 1).padStart(4, '0');
  return `ACT-${year}-${nextNum}`;
};

// @route   GET /api/action-closures
// @desc    Get action closures list and dashboard summary metrics
router.get('/', protect, async (req, res) => {
  try {
    const list = await ActionClosureTracker.find({}).sort({ createdAt: -1 });

    const totalCount = list.length;
    const openCount = list.filter(a => a.status === 'Open' || a.status === 'Reopened').length;
    const inProgressCount = list.filter(a => a.status === 'In Progress').length;
    const pendingVerificationCount = list.filter(a => a.status === 'Pending Verification').length;
    const closedCount = list.filter(a => a.status === 'Closed').length;

    const now = new Date();
    const overdueCount = list.filter(a => a.status !== 'Closed' && a.dueDate && new Date(a.dueDate) < now).length;

    // Calculate Average Closure Days
    let totalClosureDays = 0;
    let closedWithTime = 0;
    list.forEach(a => {
      if (a.status === 'Closed' && a.closureDate) {
        const diffMs = new Date(a.closureDate) - new Date(a.createdAt);
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        totalClosureDays += (diffDays >= 0 ? diffDays : 0);
        closedWithTime += 1;
      }
    });
    const averageClosureDays = closedWithTime > 0 ? Math.round(totalClosureDays / closedWithTime * 10) / 10 : 0;

    res.json({
      data: list,
      summary: {
        total: totalCount,
        open: openCount,
        inProgress: inProgressCount,
        pendingVerification: pendingVerificationCount,
        closed: closedCount,
        overdue: overdueCount,
        averageClosureDays
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/action-closures
// @desc    Create a new action item entry
router.post('/', protect, async (req, res) => {
  const { observationType, department, description, priority, dueDate } = req.body;

  if (!dueDate) {
    return res.status(400).json({ message: 'Due date is mandatory' });
  }

  try {
    const obsId = await generateActionId();

    const action = await ActionClosureTracker.create({
      observationId: obsId,
      observationType,
      department,
      description,
      priority,
      status: 'Open',
      creatorId: req.user.id,
      creatorName: req.user.name,
      dueDate,
      history: [{
        status: 'Open',
        updatedBy: req.user.name,
        notes: 'Action item created.'
      }],
      auditLog: [{
        action: 'CREATE_ACTION',
        actorName: req.user.name,
        details: `Created Action Item ${obsId}: ${observationType}`
      }]
    });

    res.status(201).json(action);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/action-closures/:id/assign
// @desc    Assign owner and reviewer details
router.put('/:id/assign', protect, async (req, res) => {
  const { assignedToId, responsibleDepartment, dueDate, reviewerId, remarks } = req.body;

  try {
    const action = await ActionClosureTracker.findById(req.params.id);
    if (!action) return res.status(404).json({ message: 'Action item not found' });

    let assignedToName = '';
    let reviewerName = '';

    if (assignedToId) {
      const emp = await Employee.findOne({ id: assignedToId });
      if (emp) assignedToName = emp.name;
    }
    if (reviewerId) {
      const emp = await Employee.findOne({ id: reviewerId });
      if (emp) reviewerName = emp.name;
    }

    action.assignedToId = assignedToId || action.assignedToId;
    action.assignedToName = assignedToName || action.assignedToName;
    action.responsibleDepartment = responsibleDepartment || action.responsibleDepartment;
    action.dueDate = dueDate || action.dueDate;
    action.reviewerId = reviewerId || action.reviewerId;
    action.reviewerName = reviewerName || action.reviewerName;
    action.remarks = remarks || action.remarks;
    action.status = 'In Progress';

    action.history.push({
      status: 'In Progress',
      updatedBy: req.user.name,
      notes: `Assigned item to ${assignedToName || assignedToId} under review by ${reviewerName}.`
    });

    action.auditLog.push({
      action: 'ASSIGN_ACTION',
      actorName: req.user.name,
      details: `Assigned item ${action.observationId} to ${assignedToName}`
    });

    await action.save();

    // Notify Assignee
    if (assignedToId) {
      const notif = await Notification.create({
        type: 'alert',
        title: 'New Action Assignment',
        desc: `Action item ${action.observationId} has been assigned to you.`,
        empId: assignedToId
      });
      req.io.to(assignedToId).emit('notification', notif);
    }

    res.json(action);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/action-closures/:id/progress
// @desc    Update progress metrics and submit updates
router.put('/:id/progress', protect, async (req, res) => {
  const { progressStatus, completionPercentage, updateNotes, evidenceUrl } = req.body;

  try {
    const action = await ActionClosureTracker.findById(req.params.id);
    if (!action) return res.status(404).json({ message: 'Action item not found' });

    if (action.status === 'Closed') {
      return res.status(400).json({ message: 'Closed action records cannot be modified' });
    }

    // Add progress update sub-document
    action.updates.push({
      progressStatus,
      completionPercentage: completionPercentage || 0,
      updateNotes,
      evidenceUrl,
      updatedBy: req.user.name
    });

    // If marked as Pending Verification
    if (progressStatus === 'Pending Verification') {
      action.status = 'Pending Verification';
    } else {
      action.status = 'In Progress';
    }

    action.history.push({
      status: action.status,
      updatedBy: req.user.name,
      notes: `Progress update: ${updateNotes} (${completionPercentage}% complete).`
    });

    action.auditLog.push({
      action: 'UPDATE_PROGRESS',
      actorName: req.user.name,
      details: `Updated progress on ${action.observationId} to ${completionPercentage}%`
    });

    await action.save();

    // Notify reviewer if verification is pending
    if (action.status === 'Pending Verification' && action.reviewerId) {
      const notif = await Notification.create({
        type: 'alert',
        title: 'Closure Verification Pending',
        desc: `Action item ${action.observationId} is pending your verification review.`,
        empId: action.reviewerId
      });
      req.io.to(action.reviewerId).emit('notification', notif);
    }

    res.json(action);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/action-closures/:id/verify
// @desc    Verify and Approve Closure or Reopen
router.put('/:id/verify', protect, async (req, res) => {
  const { status, comments, reopenReason } = req.body; // 'Closed' or 'Reopened'

  try {
    const action = await ActionClosureTracker.findById(req.params.id);
    if (!action) return res.status(404).json({ message: 'Action item not found' });

    // Business Rule: Only creator, reviewer, or HR can close
    const isAuthorized = req.user.role === 'hr' || req.user.id === action.reviewerId || req.user.id === action.creatorId;
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only authorized reviewers or HR Managers can verify and close action items' });
    }

    if (status === 'Closed') {
      // Business Rule: Closure evidence is mandatory
      // Find if any update has evidenceUrl
      const hasEvidence = action.updates.some(u => u.evidenceUrl && u.evidenceUrl.trim() !== '') || req.body.evidenceUrl;
      if (!hasEvidence) {
        return res.status(400).json({ message: 'Closure evidence document is mandatory for verification approval' });
      }

      action.status = 'Closed';
      action.verificationRemarks = comments;
      action.closureApprovedBy = req.user.name;
      action.closureDate = new Date();

      action.history.push({
        status: 'Closed',
        updatedBy: req.user.name,
        notes: `Verification approved. Action closed by: ${req.user.name}`
      });

      action.auditLog.push({
        action: 'VERIFY_CLOSE_ACTION',
        actorName: req.user.name,
        details: `Approved verification and closed action ${action.observationId}.`
      });

    } else if (status === 'Reopened') {
      if (!reopenReason) {
        return res.status(400).json({ message: 'A reason is mandatory to reopen an action item.' });
      }

      action.status = 'Reopened';
      action.reopenReason = reopenReason;
      action.verificationRemarks = comments;

      action.history.push({
        status: 'Reopened',
        updatedBy: req.user.name,
        notes: `Reopened action item. Reason: ${reopenReason}`
      });

      action.auditLog.push({
        action: 'REOPEN_ACTION',
        actorName: req.user.name,
        details: `Reopened action ${action.observationId}. Reason: ${reopenReason}`
      });

      // Notify assignee
      if (action.assignedToId) {
        const notif = await Notification.create({
          type: 'alert',
          title: 'Action Item Reopened',
          desc: `Action item ${action.observationId} has been reopened: ${reopenReason}`,
          empId: action.assignedToId
        });
        req.io.to(action.assignedToId).emit('notification', notif);
      }
    }

    await action.save();
    res.json(action);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/action-closures/reports
// @desc    Retrieve compliance reports stats
router.get('/reports', protect, async (req, res) => {
  try {
    const list = await ActionClosureTracker.find({});
    
    const now = new Date();
    const openList = list.filter(a => a.status === 'Open' || a.status === 'In Progress' || a.status === 'Reopened');
    const overdueList = list.filter(a => a.status !== 'Closed' && a.dueDate && new Date(a.dueDate) < now);

    // Department breakdown
    const deptStats = {};
    list.forEach(a => {
      if (!deptStats[a.department]) {
        deptStats[a.department] = { total: 0, closed: 0 };
      }
      deptStats[a.department].total += 1;
      if (a.status === 'Closed') {
        deptStats[a.department].closed += 1;
      }
    });

    const deptReport = Object.keys(deptStats).map(d => ({
      department: d,
      total: deptStats[d].total,
      closed: deptStats[d].closed,
      rate: Math.round(deptStats[d].closed / deptStats[d].total * 100)
    }));

    res.json({
      openList,
      overdueList,
      deptReport
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
