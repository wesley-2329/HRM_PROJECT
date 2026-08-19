const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const Grievance = require('../models/Grievance');
const HelpdeskTicket = require('../models/HelpdeskTicket');
const WelfareRequest = require('../models/WelfareRequest');
const RecognitionPost = require('../models/RecognitionPost');
const Communication = require('../models/Communication');
const CommunicationReadLog = require('../models/CommunicationReadLog');
const EngagementCategoryMaster = require('../models/EngagementCategoryMaster');
const EngagementAuditLog = require('../models/EngagementAuditLog');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to log audit actions
const logAudit = async (req, entityType, entityId, action, previousState, newState, comments) => {
  try {
    const user = req.user || { id: 'SYSTEM', name: 'System User', role: 'system' };
    await EngagementAuditLog.create({
      entityType,
      entityId,
      action,
      performedBy: {
        id: user.id || user._id || 'SYSTEM',
        name: user.name || 'User',
        role: user.role || 'employee'
      },
      previousState: previousState || '',
      newState: newState || '',
      comments: comments || ''
    });
  } catch (e) {
    console.error('Audit Log Error:', e);
  }
};

// ==========================================
// 1. SUGGESTIONS
// ==========================================

// Get Suggestions
router.get('/suggestions', protect, async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let filter = {};
    
    // Non-HR users see public approved/implemented OR their own suggestions
    if (req.user.role !== 'hr') {
      filter = {
        $or: [
          { 'submittedBy.id': req.user.id },
          { status: { $in: ['Approved', 'Implemented'] } }
        ]
      };
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { suggestionId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const suggestions = await Suggestion.find(filter).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit Suggestion
router.post('/suggestions', protect, async (req, res) => {
  try {
    const count = await Suggestion.countDocuments();
    const suggestionId = `SUG-${1000 + count + 1}`;
    
    const newSug = new Suggestion({
      suggestionId,
      title: req.body.title,
      category: req.body.category || 'Process Improvement',
      description: req.body.description,
      businessImpact: req.body.businessImpact || '',
      estimatedBenefit: req.body.estimatedBenefit || '',
      attachment: req.body.attachment || '',
      priority: req.body.priority || 'Medium',
      submittedBy: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        dept: req.user.dept || 'Operations'
      },
      history: [{
        action: 'Submitted',
        performedBy: req.user.name,
        role: req.user.role,
        comments: 'Initial suggestion submitted'
      }]
    });

    await newSug.save();
    await logAudit(req, 'Suggestion', suggestionId, 'Created', '', 'Submitted', 'Suggestion created');
    res.status(201).json(newSug);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Suggestion Status
router.put('/suggestions/:id/status', protect, async (req, res) => {
  try {
    const sug = await Suggestion.findById(req.params.id);
    if (!sug) return res.status(404).json({ message: 'Suggestion not found' });

    const prevStatus = sug.status;
    const { status, reviewerComments, evaluatorComments, rewardBadge, rewardPoints } = req.body;

    if (status) sug.status = status;
    if (reviewerComments) sug.reviewerComments = reviewerComments;
    if (evaluatorComments) sug.evaluatorComments = evaluatorComments;
    if (rewardBadge) sug.rewardBadge = rewardBadge;
    if (rewardPoints !== undefined) sug.rewardPoints = rewardPoints;

    sug.history.push({
      action: status,
      performedBy: req.user.name,
      role: req.user.role,
      comments: reviewerComments || evaluatorComments || `Status updated to ${status}`
    });

    await sug.save();
    await logAudit(req, 'Suggestion', sug.suggestionId, 'Status Update', prevStatus, status, reviewerComments || '');
    res.json(sug);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 2. GRIEVANCES
// ==========================================

// Get Grievances
router.get('/grievances', protect, async (req, res) => {
  try {
    const { severity, status, search } = req.query;
    let filter = {};

    // Confidential grievances are visible only to HR or the assigned officer or the raiser
    if (req.user.role !== 'hr') {
      filter = {
        $or: [
          { 'raisedBy.id': req.user.id },
          { 'assignedOfficer.id': req.user.id }
        ]
      };
    }

    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (search) {
      filter.subject = { $regex: search, $options: 'i' };
    }

    const grievances = await Grievance.find(filter).sort({ createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Raise Grievance
router.post('/grievances', protect, async (req, res) => {
  try {
    const count = await Grievance.countDocuments();
    const grievanceId = `GRV-${1000 + count + 1}`;

    const newGrv = new Grievance({
      grievanceId,
      category: req.body.category || 'Workplace Environment',
      subject: req.body.subject,
      description: req.body.description,
      severity: req.body.severity || 'Medium',
      isConfidential: req.body.isConfidential || false,
      raisedBy: {
        id: req.user.id,
        name: req.user.name,
        dept: req.user.dept || 'General'
      },
      history: [{
        status: 'Submitted',
        actionBy: req.user.name,
        role: req.user.role,
        notes: 'Grievance submitted'
      }]
    });

    await newGrv.save();
    await logAudit(req, 'Grievance', grievanceId, 'Raised', '', 'Submitted', req.body.subject);
    res.status(201).json(newGrv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Assign / Resolve Grievance
router.put('/grievances/:id', protect, async (req, res) => {
  try {
    const grv = await Grievance.findById(req.params.id);
    if (!grv) return res.status(404).json({ message: 'Grievance not found' });

    const prevStatus = grv.status;
    const { assignedOfficer, status, investigationNotes, resolution, employeeFeedback } = req.body;

    if (assignedOfficer) grv.assignedOfficer = assignedOfficer;
    if (status) grv.status = status;
    if (investigationNotes) grv.investigationNotes = investigationNotes;
    if (resolution) grv.resolution = resolution;
    if (employeeFeedback) grv.employeeFeedback = employeeFeedback;
    if (status === 'Closed' || status === 'Resolved') grv.closureDate = new Date();

    grv.history.push({
      status: status || grv.status,
      actionBy: req.user.name,
      role: req.user.role,
      notes: resolution || investigationNotes || `Updated grievance to ${status || grv.status}`
    });

    await grv.save();
    await logAudit(req, 'Grievance', grv.grievanceId, 'Update', prevStatus, grv.status, resolution || '');
    res.json(grv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 3. HELPDESK TICKETS
// ==========================================

// Get Helpdesk Tickets
router.get('/helpdesk', protect, async (req, res) => {
  try {
    const { priority, status, category } = req.query;
    let filter = {};

    if (req.user.role !== 'hr') {
      filter = {
        $or: [
          { 'raisedBy.id': req.user.id },
          { 'assignedTo.id': req.user.id }
        ]
      };
    }

    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const tickets = await HelpdeskTicket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Helpdesk Ticket
router.post('/helpdesk', protect, async (req, res) => {
  try {
    const count = await HelpdeskTicket.countDocuments();
    const ticketId = `HD-${1000 + count + 1}`;
    const slaHours = req.body.priority === 'Critical' ? 4 : req.body.priority === 'High' ? 12 : 24;
    const dueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const newTicket = new HelpdeskTicket({
      ticketId,
      category: req.body.category || 'IT Support',
      subcategory: req.body.subcategory || 'General',
      subject: req.body.subject,
      description: req.body.description,
      priority: req.body.priority || 'Medium',
      raisedBy: {
        id: req.user.id,
        name: req.user.name,
        dept: req.user.dept || 'General',
        email: req.user.email || ''
      },
      slaHours,
      dueDate,
      history: [{
        action: 'Created',
        actor: req.user.name,
        comment: 'Ticket opened by user'
      }]
    });

    await newTicket.save();
    await logAudit(req, 'Helpdesk', ticketId, 'Created', '', 'Open', req.body.subject);
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Ticket Status / Assign / Resolve / Rate
router.put('/helpdesk/:id', protect, async (req, res) => {
  try {
    const ticket = await HelpdeskTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const prevStatus = ticket.status;
    const { assignedTo, status, resolutionNotes, rating } = req.body;

    if (assignedTo) ticket.assignedTo = assignedTo;
    if (status) ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    if (rating !== undefined) ticket.rating = rating;

    ticket.history.push({
      action: status || 'Update',
      actor: req.user.name,
      comment: resolutionNotes || `Ticket updated to ${status || ticket.status}`
    });

    await ticket.save();
    await logAudit(req, 'Helpdesk', ticket.ticketId, 'Update', prevStatus, ticket.status, resolutionNotes || '');
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 4. WELFARE REQUESTS
// ==========================================

// Get Welfare Requests
router.get('/welfare', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'hr') {
      filter['requestedBy.id'] = req.user.id;
    }
    const requests = await WelfareRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit Welfare Request
router.post('/welfare', protect, async (req, res) => {
  try {
    const count = await WelfareRequest.countDocuments();
    const requestId = `WEL-${1000 + count + 1}`;

    const newReq = new WelfareRequest({
      requestId,
      welfareType: req.body.welfareType,
      description: req.body.description,
      amount: req.body.amount || 0,
      documents: req.body.documents || [],
      requestedBy: {
        id: req.user.id,
        name: req.user.name,
        dept: req.user.dept || 'General'
      },
      history: [{
        status: 'Submitted',
        updatedBy: req.user.name,
        remarks: 'Welfare benefit requested'
      }]
    });

    await newReq.save();
    await logAudit(req, 'Welfare', requestId, 'Requested', '', 'Submitted', req.body.welfareType);
    res.status(201).json(newReq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Approve / Verify Welfare Request
router.put('/welfare/:id/status', protect, async (req, res) => {
  try {
    const reqItem = await WelfareRequest.findById(req.params.id);
    if (!reqItem) return res.status(404).json({ message: 'Welfare request not found' });

    const prevStatus = reqItem.status;
    const { status, approvalRemarks } = req.body;

    if (status) reqItem.status = status;
    if (approvalRemarks) reqItem.approvalRemarks = approvalRemarks;

    if (status === 'HR Verified') reqItem.verifier = req.user.name;
    if (status === 'Management Approved' || status === 'Benefit Issued') reqItem.approver = req.user.name;

    reqItem.history.push({
      status,
      updatedBy: req.user.name,
      remarks: approvalRemarks || `Welfare request marked as ${status}`
    });

    await reqItem.save();
    await logAudit(req, 'Welfare', reqItem.requestId, 'Status Change', prevStatus, status, approvalRemarks || '');
    res.json(reqItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 5. RECOGNITION WALL
// ==========================================

// Get Recognition Posts
router.get('/recognition', protect, async (req, res) => {
  try {
    const posts = await RecognitionPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Recognition Post
router.post('/recognition', protect, async (req, res) => {
  try {
    const count = await RecognitionPost.countDocuments();
    const recognitionId = `REC-${1000 + count + 1}`;

    const newPost = new RecognitionPost({
      recognitionId,
      recipient: req.body.recipient,
      recognizedBy: {
        id: req.user.id,
        name: req.user.name,
        dept: req.user.dept || 'HR',
        avatar: req.user.avatar || ''
      },
      category: req.body.category || 'Spot Award',
      badge: req.body.badge || '⭐ Star Performer',
      appreciationMessage: req.body.appreciationMessage,
      visibility: req.body.visibility || 'Company-wide'
    });

    await newPost.save();
    await logAudit(req, 'Recognition', recognitionId, 'Published', '', 'Published', `Recognized ${req.body.recipient.name}`);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Like / Comment Recognition Post
router.post('/recognition/:id/interact', protect, async (req, res) => {
  try {
    const post = await RecognitionPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { action, commentText } = req.body;

    if (action === 'like') {
      const idx = post.likes.indexOf(req.user.id);
      if (idx > -1) {
        post.likes.splice(idx, 1);
      } else {
        post.likes.push(req.user.id);
      }
    } else if (action === 'comment' && commentText) {
      post.comments.push({
        id: req.user.id,
        userName: req.user.name,
        commentText
      });
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 6. ORGANIZATION COMMUNICATIONS
// ==========================================

// Get Communications
router.get('/communications', protect, async (req, res) => {
  try {
    const comms = await Communication.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    
    // Fetch user read logs
    const readLogs = await CommunicationReadLog.find({ employeeId: req.user.id });
    const readMap = {};
    readLogs.forEach(l => {
      readMap[l.communicationId] = { readAt: l.readAt, acknowledged: l.acknowledged };
    });

    const enrichedComms = comms.map(c => {
      const log = readMap[c.communicationId] || {};
      return {
        ...c.toObject(),
        isRead: !!log.readAt,
        isAcknowledged: !!log.acknowledged
      };
    });

    res.json(enrichedComms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Publish Communication
router.post('/communications', protect, async (req, res) => {
  try {
    const count = await Communication.countDocuments();
    const communicationId = `COM-${1000 + count + 1}`;

    const newComm = new Communication({
      communicationId,
      title: req.body.title,
      category: req.body.category || 'Announcement',
      content: req.body.content,
      targetAudience: req.body.targetAudience || 'All Employees',
      publishDate: req.body.publishDate || new Date(),
      expiryDate: req.body.expiryDate || null,
      attachment: req.body.attachment || '',
      acknowledgementRequired: req.body.acknowledgementRequired || false,
      author: {
        id: req.user.id,
        name: req.user.name
      }
    });

    await newComm.save();
    await logAudit(req, 'Communication', communicationId, 'Published', '', 'Published', req.body.title);
    res.status(201).json(newComm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark Read / Acknowledge Communication
router.post('/communications/:commId/read', protect, async (req, res) => {
  try {
    const { acknowledge } = req.body;
    let log = await CommunicationReadLog.findOne({
      communicationId: req.params.commId,
      employeeId: req.user.id
    });

    if (!log) {
      log = new CommunicationReadLog({
        communicationId: req.params.commId,
        employeeId: req.user.id,
        employeeName: req.user.name,
        readAt: new Date()
      });
    }

    if (acknowledge) {
      log.acknowledged = true;
      log.acknowledgedAt = new Date();
    }

    await log.save();
    await logAudit(req, 'Communication', req.params.commId, acknowledge ? 'Acknowledged' : 'Read', '', 'ReadLogUpdated', `Read by ${req.user.name}`);
    res.json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================
// 7. DASHBOARD METRICS
// ==========================================

router.get('/dashboard', protect, async (req, res) => {
  try {
    const totalComms = await Communication.countDocuments({ status: 'Published' });
    const openGrievances = await Grievance.countDocuments({ status: { $in: ['Submitted', 'Assigned', 'Under Investigation'] } });
    const openTickets = await HelpdeskTicket.countDocuments({ status: { $in: ['Open', 'Assigned', 'In Progress'] } });
    const pendingWelfare = await WelfareRequest.countDocuments({ status: { $in: ['Submitted', 'HR Verified'] } });
    const totalRecognitions = await RecognitionPost.countDocuments();
    const totalSuggestions = await Suggestion.countDocuments();

    res.json({
      activeCommunications: totalComms,
      openGrievances,
      openHelpdeskTickets: openTickets,
      welfareRequestsPending: pendingWelfare,
      recognitionPosts: totalRecognitions,
      suggestionCount: totalSuggestions,
      employeeEngagementScore: '94.2%',
      slaPerformanceScore: '98.5%'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. AUDIT LOGS
// ==========================================

router.get('/audit', protect, async (req, res) => {
  try {
    const logs = await EngagementAuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
