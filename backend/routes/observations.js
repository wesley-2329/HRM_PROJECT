const express = require('express');
const router = express.Router();
const ObservationTracker = require('../models/ObservationTracker');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to generate next observation ID
const generateObsId = async () => {
  const year = new Date().getFullYear();
  const count = await ObservationTracker.countDocuments({
    observationId: new RegExp(`^OBS-${year}-`)
  });
  const nextNum = String(count + 1).padStart(4, '0');
  return `OBS-${year}-${nextNum}`;
};

// @route   GET /api/observations
// @desc    Get observations list and summary dashboard metrics
router.get('/', protect, async (req, res) => {
  try {
    const list = await ObservationTracker.find({}).sort({ createdAt: -1 });
    
    // Calculate summary stats
    const totalCount = list.length;
    const openCount = list.filter(o => o.status === 'Open' || o.status === 'Assigned' || o.status === 'In Progress' || o.status === 'Reopened').length;
    const closedCount = list.filter(o => o.status === 'Closed').length;
    const reviewCount = list.filter(o => o.status === 'Under Review').length;
    
    const now = new Date();
    const overdueCount = list.filter(o => o.status !== 'Closed' && o.dueDate && new Date(o.dueDate) < now).length;

    res.json({
      data: list,
      summary: {
        total: totalCount,
        open: openCount,
        closed: closedCount,
        underReview: reviewCount,
        overdue: overdueCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/observations
// @desc    Create a new observation
router.post('/', protect, async (req, res) => {
  const { title, description, department, category, priority, assigneeId, dueDate } = req.body;

  if (!dueDate) {
    return res.status(400).json({ message: 'Due date is mandatory' });
  }

  try {
    const obsId = await generateObsId();
    let status = 'Open';
    let assigneeName = '';
    let assignmentDate = null;

    if (assigneeId) {
      const emp = await Employee.findOne({ id: assigneeId });
      if (emp) {
        assigneeName = emp.name;
        status = 'Assigned';
        assignmentDate = new Date();
      }
    }

    const obs = await ObservationTracker.create({
      observationId: obsId,
      title,
      description,
      department,
      category,
      priority,
      status,
      creatorId: req.user.id,
      creatorName: req.user.name,
      assigneeId,
      assigneeName,
      assignmentDate,
      dueDate,
      history: [{
        status,
        updatedBy: req.user.name,
        notes: 'Observation recorded and initialized.'
      }],
      auditLog: [{
        action: 'CREATE_OBSERVATION',
        actorName: req.user.name,
        details: `Recorded observation ${obsId}: ${title}`,
        newValues: { title, description, department, category, priority, status }
      }]
    });

    // Notify Assignee and Department Head
    if (assigneeId) {
      const notif = await Notification.create({
        type: 'alert',
        title: 'New Observation Assigned',
        desc: `You have been assigned observation ${obsId}: ${title}`,
        empId: assigneeId
      });
      req.io.to(assigneeId).emit('notification', notif);
    }

    res.status(201).json(obs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/observations/:id/assign
// @desc    Update assignee
router.put('/:id/assign', protect, async (req, res) => {
  const { assigneeId, dueDate } = req.body;

  try {
    const obs = await ObservationTracker.findById(req.params.id);
    if (!obs) return res.status(404).json({ message: 'Observation not found' });

    const oldAssignee = obs.assigneeId;
    let assigneeName = '';
    let status = obs.status;

    if (assigneeId) {
      const emp = await Employee.findOne({ id: assigneeId });
      if (emp) {
        assigneeName = emp.name;
        status = 'Assigned';
      }
    }

    const oldValues = { assigneeId: obs.assigneeId, assigneeName: obs.assigneeName, dueDate: obs.dueDate, status: obs.status };

    obs.assigneeId = assigneeId || obs.assigneeId;
    obs.assigneeName = assigneeName || obs.assigneeName;
    obs.assignmentDate = new Date();
    obs.dueDate = dueDate || obs.dueDate;
    obs.status = status;
    
    obs.history.push({
      status,
      updatedBy: req.user.name,
      notes: `Assigned ownership to ${assigneeName || assigneeId}.`
    });

    obs.auditLog.push({
      action: 'ASSIGN_OWNER',
      actorName: req.user.name,
      details: `Assigned observation ${obs.observationId} to ${assigneeName}`,
      oldValues,
      newValues: { assigneeId: obs.assigneeId, assigneeName: obs.assigneeName, dueDate: obs.dueDate, status: obs.status }
    });

    await obs.save();

    // Notify Assignee
    if (assigneeId && assigneeId !== oldAssignee) {
      const notif = await Notification.create({
        type: 'alert',
        title: 'New Observation Assignment',
        desc: `Observation ${obs.observationId} has been assigned to you.`,
        empId: assigneeId
      });
      req.io.to(assigneeId).emit('notification', notif);
    }

    res.json(obs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/observations/:id/action
// @desc    Submit Action Taken (evidence, corrective actions)
router.put('/:id/action', protect, async (req, res) => {
  const { correctiveAction, rootCause, preventiveAction, evidenceUrl } = req.body;

  try {
    const obs = await ObservationTracker.findById(req.params.id);
    if (!obs) return res.status(404).json({ message: 'Observation not found' });

    if (obs.status === 'Closed') {
      return res.status(400).json({ message: 'Closed observation cannot be edited' });
    }

    const oldValues = { correctiveAction: obs.correctiveAction, rootCause: obs.rootCause, status: obs.status };

    obs.correctiveAction = correctiveAction;
    obs.rootCause = rootCause;
    obs.preventiveAction = preventiveAction;
    obs.completionDate = new Date();
    obs.evidenceUrl = evidenceUrl || obs.evidenceUrl;
    obs.status = 'Under Review';

    obs.history.push({
      status: 'Under Review',
      updatedBy: req.user.name,
      notes: 'Submitted corrective actions and evidence for verification review.'
    });

    obs.auditLog.push({
      action: 'SUBMIT_ACTION',
      actorName: req.user.name,
      details: `Submitted corrective action details for observation ${obs.observationId}`,
      oldValues,
      newValues: { correctiveAction, rootCause, preventiveAction, status: 'Under Review', evidenceUrl: obs.evidenceUrl }
    });

    await obs.save();

    // Notify Creator
    const notif = await Notification.create({
      type: 'alert',
      title: 'Action Submitted for Review',
      desc: `Action details submitted for observation ${obs.observationId} pending closure.`,
      empId: obs.creatorId
    });
    req.io.to(obs.creatorId).emit('notification', notif);

    res.json(obs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/observations/:id/verify
// @desc    Verify & Close or Reopen observation
router.put('/:id/verify', protect, async (req, res) => {
  const { status, comments, reopenReason } = req.body; // 'Closed' or 'Reopened'

  try {
    const obs = await ObservationTracker.findById(req.params.id);
    if (!obs) return res.status(404).json({ message: 'Observation not found' });

    // Business Rule: Only Creator/HR/Approver can close
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only authorized HR / Approvers can verify and close observations' });
    }

    if (status === 'Closed') {
      // Business Rule: Evidence is mandatory for closure
      if (!obs.evidenceUrl && !req.body.evidenceUrl) {
        return res.status(400).json({ message: 'Evidence document/URL is mandatory for closure verification' });
      }

      obs.status = 'Closed';
      obs.verificationComments = comments;
      obs.closureDate = new Date();
      
      obs.history.push({
        status: 'Closed',
        updatedBy: req.user.name,
        notes: `Observation verification complete. Approved closure by HR/Approver: ${comments}`
      });

      obs.auditLog.push({
        action: 'VERIFY_CLOSE',
        actorName: req.user.name,
        details: `Approved verification and closed observation ${obs.observationId}.`
      });

    } else if (status === 'Reopened') {
      if (!reopenReason) {
        return res.status(400).json({ message: 'A reason is mandatory to reopen an observation.' });
      }

      obs.status = 'Reopened';
      obs.reopenReason = reopenReason;
      obs.verificationComments = comments;
      
      obs.history.push({
        status: 'Reopened',
        updatedBy: req.user.name,
        notes: `Reopened observation. Reason: ${reopenReason}`
      });

      obs.auditLog.push({
        action: 'REOPEN_OBSERVATION',
        actorName: req.user.name,
        details: `Reopened observation ${obs.observationId}. Reason: ${reopenReason}`
      });

      // Notify Assignee
      if (obs.assigneeId) {
        const notif = await Notification.create({
          type: 'alert',
          title: 'Observation Reopened',
          desc: `Observation ${obs.observationId} has been reopened: ${reopenReason}`,
          empId: obs.assigneeId
        });
        req.io.to(obs.assigneeId).emit('notification', notif);
      }
    }

    await obs.save();
    res.json(obs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/observations/reports
// @desc    Retrieve compliance observation reports
router.get('/reports', protect, async (req, res) => {
  try {
    const list = await ObservationTracker.find({});
    
    // Department breakdown
    const deptStats = {};
    // Priority breakdown
    const priorityStats = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    
    list.forEach(o => {
      deptStats[o.department] = (deptStats[o.department] || 0) + 1;
      priorityStats[o.priority] = (priorityStats[o.priority] || 0) + 1;
    });

    const now = new Date();
    const overdueList = list.filter(o => o.status !== 'Closed' && o.dueDate && new Date(o.dueDate) < now);
    const pendingList = list.filter(o => o.status === 'Under Review');

    res.json({
      departmentReport: Object.keys(deptStats).map(d => ({ department: d, count: deptStats[d] })),
      priorityReport: priorityStats,
      overdueReport: overdueList,
      pendingReport: pendingList
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
