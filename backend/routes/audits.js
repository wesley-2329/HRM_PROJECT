const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// Helper to prefill checklist questions based on category
const getCategoryChecklist = (category) => {
  const templates = {
    'HR': [
      { question: 'Are employee personnel files complete with ID proof, contracts, and educational certificates?', complianceRequirement: 'Statutory HR Records' },
      { question: 'Is the employee handbook signed and acknowledged by all active staff?', complianceRequirement: 'Internal Compliance policy' },
      { question: 'Is the onboarding checklist completed for all new joiners?', complianceRequirement: 'Audit Guidelines' }
    ],
    'Payroll': [
      { question: 'Are salary calculations and registers aligned with monthly timesheets?', complianceRequirement: 'Wage Registers under Labor Code' },
      { question: 'Are professional tax (PT) and income tax deductions verified for the latest slabs?', complianceRequirement: 'Income Tax Act & PT Rules' },
      { question: 'Is the salary disbursement cycle approved by the finance board?', complianceRequirement: 'Internal Controls' }
    ],
    'Attendance': [
      { question: 'Is daily punch logs data verified for shift scheduling compliance?', complianceRequirement: 'Factories Act / Shops & Est Act' },
      { question: 'Are monthly leave balances calculated and capped correctly?', complianceRequirement: 'Standing Orders' },
      { question: 'Is overtime compensation verified against timesheet summaries?', complianceRequirement: 'Labor Guidelines' }
    ],
    'Compliance': [
      { question: 'Are POSH training certifications updated for all teams?', complianceRequirement: 'POSH Act Compliance' },
      { question: 'Is the company policy repository up to date with active version logs?', complianceRequirement: 'Governance Standards' },
      { question: 'Are display boards for statutory information posted in public spaces?', complianceRequirement: 'Statutory Displays' }
    ],
    'Recruitment': [
      { question: 'Are background checks completed for all newly onboarded profiles?', complianceRequirement: 'Security audit standard' },
      { question: 'Are candidate screening scorecards and ATS records fully documented?', complianceRequirement: 'HR Quality standard' },
      { question: 'Are offer letters signed and matched to approved headcount budgets?', complianceRequirement: 'Financial matrix compliance' }
    ],
    'Statutory': [
      { question: 'Are monthly PF and ESI filings deposited on time?', complianceRequirement: 'EPF & ESI Acts' },
      { question: 'Is the annual statutory return filed under appropriate local labor laws?', complianceRequirement: 'Shops & Establishments Act' },
      { question: 'Are statutory registers (Muster roll, Wages, Fines) maintained up to date?', complianceRequirement: 'Labor Law Registries' }
    ]
  };
  return (templates[category] || []).map(item => ({
    category,
    question: item.question,
    complianceRequirement: item.complianceRequirement,
    status: 'Compliant'
  }));
};

// @route   GET /api/audits/stats
// @desc    Get audit stats for dashboard
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Audit.countDocuments();
    const open = await Audit.countDocuments({ status: { $ne: 'Closed' } });
    const closed = await Audit.countDocuments({ status: 'Closed' });
    
    // Overdue audits: not closed and date is past
    const now = new Date();
    const overdue = await Audit.countDocuments({ 
      status: { $ne: 'Closed' },
      date: { $lt: now }
    });

    // Pending CAPA actions count
    const audits = await Audit.find({ status: { $ne: 'Closed' } });
    let pendingActions = 0;
    audits.forEach(audit => {
      pendingActions += audit.actions.filter(a => a.status !== 'Closed').length;
    });

    res.json({
      totalAudits: total,
      openAudits: open,
      closedAudits: closed,
      overdueAudits: overdue,
      pendingActions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/audits
// @desc    Get all audits
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const audits = await Audit.find().sort({ createdAt: -1 });
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/audits
// @desc    Create a new audit plan
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, type, category, date, department, auditorName } = req.body;

  try {
    const count = await Audit.countDocuments();
    const auditNumber = `AUD-${1001 + count}`;

    const defaultChecklist = getCategoryChecklist(category);

    const audit = new Audit({
      auditNumber,
      name,
      type,
      category,
      date,
      department,
      auditorName,
      status: 'Planned',
      checklist: defaultChecklist,
      historyLog: [{
        status: 'Planned',
        notes: `Audit plan "${name}" created. Scheduled for ${new Date(date).toLocaleDateString()}`,
        updatedBy: req.user.name
      }]
    });

    const savedAudit = await audit.save();

    // Trigger Notification for new Audit scheduled
    await Notification.create({
      type: 'reminder',
      title: 'New Audit Scheduled',
      desc: `Audit "${name}" (${auditNumber}) has been scheduled for ${new Date(date).toLocaleDateString()} under ${department} department.`,
      empId: '' // Global to HR/Depts
    });

    res.status(201).json(savedAudit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/audits/:id/checklist
// @desc    Conduct audit: update checklist item status
// @access  Private/Admin
router.put('/:id/checklist', protect, adminOnly, async (req, res) => {
  const { checklist } = req.body; // array of items with _id and status

  try {
    const audit = await Audit.findById(req.id || req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    // Update checklist statuses
    checklist.forEach(updatedItem => {
      const dbItem = audit.checklist.id(updatedItem._id);
      if (dbItem) {
        dbItem.status = updatedItem.status;
      }
    });

    // Automatically transition status to 'In Progress' if it was 'Planned'
    if (audit.status === 'Planned') {
      audit.status = 'In Progress';
      audit.historyLog.push({
        status: 'In Progress',
        notes: 'Checklist updated. Audit execution started.',
        updatedBy: req.user.name
      });
    }

    await audit.save();
    res.json(audit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/audits/:id/observations
// @desc    Record audit observations & evidence files
// @access  Private/Admin
router.put('/:id/observations', protect, adminOnly, async (req, res) => {
  const { observation, severity, evidenceUrl } = req.body;

  try {
    const audit = await Audit.findById(req.id || req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    // Enforce Business Rule: Evidence Upload Mandatory For Major Findings
    if ((severity === 'High' || severity === 'Critical') && (!evidenceUrl || evidenceUrl.trim() === '')) {
      return res.status(400).json({ message: `Evidence upload is mandatory for major finding severity levels (${severity}).` });
    }

    audit.observations.push({
      observation,
      severity,
      evidenceUrl
    });

    audit.status = 'Observations Recorded';
    audit.historyLog.push({
      status: 'Observations Recorded',
      notes: `Recorded ${severity} severity observation: "${observation}"`,
      updatedBy: req.user.name
    });

    await audit.save();
    res.json(audit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/audits/:id/actions
// @desc    Create/Assign CAPA actions
// @access  Private/Admin
router.put('/:id/actions', protect, adminOnly, async (req, res) => {
  const { description, responsiblePerson, targetDate } = req.body;

  try {
    const audit = await Audit.findById(req.id || req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    audit.actions.push({
      description,
      responsiblePerson,
      targetDate,
      status: 'Pending'
    });

    audit.status = 'Actions Pending';
    audit.historyLog.push({
      status: 'Actions Pending',
      notes: `Corrective action assigned to ${responsiblePerson}: "${description}"`,
      updatedBy: req.user.name
    });

    await audit.save();

    // Trigger notification alert to responsible person or department
    await Notification.create({
      type: 'reminder',
      title: 'CAPA Action Assigned',
      desc: `A corrective action has been assigned: "${description}". Target date: ${new Date(targetDate).toLocaleDateString()}`,
      empId: '' // Broadcast or direct to manager
    });

    res.json(audit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/audits/:id/action-status/:actionId
// @desc    Department update action closure remarks and request verification
// @access  Private
router.put('/:id/action-status/:actionId', protect, async (req, res) => {
  const { status, closureRemarks } = req.body; // status: 'Resolved' or 'Closed'

  try {
    const audit = await Audit.findById(req.id || req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    const action = audit.actions.id(req.params.actionId);
    if (!action) return res.status(404).json({ message: 'Action item not found' });

    // Validate update logic: standard employee/dept head can set to Resolved. Only HR/Admin can close.
    if (status === 'Closed' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR Managers can approve action closure.' });
    }

    action.status = status;
    action.closureRemarks = closureRemarks;
    if (status === 'Resolved' || status === 'Closed') {
      action.closureDate = new Date();
    }

    // Adjust audit overall status automatically
    const allResolved = audit.actions.every(a => a.status === 'Resolved' || a.status === 'Closed');
    if (allResolved && audit.status === 'Actions Pending') {
      audit.status = 'Verification Pending';
    }

    audit.historyLog.push({
      status: audit.status,
      notes: `Action item status updated to ${status}. Remarks: "${closureRemarks}"`,
      updatedBy: req.user.name
    });

    await audit.save();
    res.json(audit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/audits/:id/verify-close
// @desc    Perform verification and close audit (HR Manager only)
// @access  Private/Admin
router.put('/:id/verify-close', protect, adminOnly, async (req, res) => {
  const { closureRemarks, verificationNotes } = req.body;

  try {
    const audit = await Audit.findById(req.id || req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    // Business Rule check: Audit Cannot Close Until All Actions Closed
    const openActions = audit.actions.filter(a => a.status !== 'Closed');
    if (openActions.length > 0) {
      return res.status(400).json({ message: `Audit cannot be closed. There are ${openActions.length} open CAPA action item(s) pending.` });
    }

    // Business Rule check: Only HR Manager can close (adminOnly role check already enforces this, but let's confirm role)
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR Managers are authorized to approve audit closure.' });
    }

    audit.status = 'Closed';
    audit.closureRemarks = closureRemarks;
    audit.verificationNotes = verificationNotes;
    audit.approvedBy = req.user.name;
    audit.closedAt = new Date();

    audit.historyLog.push({
      status: 'Closed',
      notes: 'HR Verification completed. Audit closed successfully.',
      updatedBy: req.user.name
    });

    const closedAudit = await audit.save();

    // Trigger Audit Closure Notification
    await Notification.create({
      type: 'reminder',
      title: 'Audit Closed Successfully',
      desc: `Audit "${audit.name}" (${audit.auditNumber}) has been verified and officially closed by ${req.user.name}.`,
      empId: '' // Global
    });

    res.json(closedAudit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Alias API Requirements support:
// 1. Create Audit POST /api/audits/create
router.post('/create', protect, async (req, res) => {
  const { name, type, category, date, department, auditorName } = req.body;
  try {
    const count = await Audit.countDocuments();
    const auditNumber = `AUD-${1001 + count}`;
    const defaultChecklist = getCategoryChecklist(category);

    const audit = new Audit({
      auditNumber,
      name,
      type,
      category,
      date,
      department,
      auditorName,
      status: 'Planned',
      checklist: defaultChecklist,
      historyLog: [{
        status: 'Planned',
        notes: `Audit plan "${name}" created via API.`,
        updatedBy: req.user.name
      }]
    });

    const savedAudit = await audit.save();
    res.status(201).json(savedAudit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. Add Observation POST /api/audits/observation
router.post('/observation', protect, async (req, res) => {
  const { auditId, observation, severity, evidenceUrl } = req.body;
  if (!auditId) return res.status(400).json({ message: 'auditId is required' });
  try {
    const audit = await Audit.findById(auditId);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });
    
    if ((severity === 'High' || severity === 'Critical') && (!evidenceUrl || evidenceUrl.trim() === '')) {
      return res.status(400).json({ message: 'Evidence mandatory for High Risk findings' });
    }

    audit.observations.push({ observation, severity, evidenceUrl });
    audit.status = 'Observations Recorded';
    audit.historyLog.push({
      status: 'Observations Recorded',
      notes: `Recorded observation: ${observation}`,
      updatedBy: req.user.name
    });
    await audit.save();
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Update Action PUT /api/audits/action
router.put('/action', protect, async (req, res) => {
  const { auditId, actionId, status, closureRemarks } = req.body;
  if (!auditId || !actionId) return res.status(400).json({ message: 'auditId and actionId are required' });
  try {
    const audit = await Audit.findById(auditId);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });
    
    const action = audit.actions.id(actionId);
    if (!action) return res.status(404).json({ message: 'Action item not found' });

    action.status = status;
    action.closureRemarks = closureRemarks;
    action.closureDate = new Date();
    
    await audit.save();
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Close Audit POST /api/audits/close
router.post('/close', protect, async (req, res) => {
  const { auditId, closureRemarks, verificationNotes } = req.body;
  if (!auditId) return res.status(400).json({ message: 'auditId is required' });
  try {
    const audit = await Audit.findById(auditId);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Only HR Managers are authorized to approve audit closure.' });
    }

    audit.status = 'Closed';
    audit.closureRemarks = closureRemarks;
    audit.verificationNotes = verificationNotes;
    audit.approvedBy = req.user.name;
    audit.closedAt = new Date();
    
    await audit.save();
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Dashboard GET /api/audits/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const total = await Audit.countDocuments();
    const open = await Audit.countDocuments({ status: { $ne: 'Closed' } });
    const closed = await Audit.countDocuments({ status: 'Closed' });
    const now = new Date();
    const overdue = await Audit.countDocuments({ 
      status: { $ne: 'Closed' },
      date: { $lt: now }
    });

    res.json({
      totalAudits: total,
      openAudits: open,
      closedAudits: closed,
      overdueAudits: overdue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
