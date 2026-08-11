const express = require('express');
const router = express.Router();
const WarningLetter = require('../models/WarningLetter');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/warning-letters
// @desc    Get warning letters (filtered for employee; all for HR)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let warnings;
    if (req.user.role === 'hr') {
      warnings = await WarningLetter.find({}).sort({ createdAt: -1 });
    } else {
      warnings = await WarningLetter.find({ empId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(warnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/warning-letters
// @desc    Issue a warning letter to an employee
// @access  HR Only
router.post('/', protect, adminOnly, async (req, res) => {
  const { empId, subject, reason } = req.body;

  try {
    const employee = await Employee.findOne({ id: empId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const warning = await WarningLetter.create({
      empId,
      empName: employee.name,
      subject,
      reason,
      date: new Date().toISOString().split('T')[0],
      status: 'Issued'
    });

    // Notify employee of warning letter
    const notif = await Notification.create({
      type: 'reminder',
      title: 'Formal Warning Letter Issued',
      desc: `HR has issued a formal warning letter regarding: "${subject}". Please check and acknowledge.`,
      empId
    });

    req.io.to(empId).emit('notification', notif);

    res.status(201).json(warning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/warning-letters/:id/acknowledge
// @desc    Acknowledge a warning letter
// @access  Private
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const warning = await WarningLetter.findById(req.params.id);
    if (!warning) {
      return res.status(404).json({ message: 'Warning letter not found' });
    }

    // Ensure employee is acknowledging their own warning letter
    if (warning.empId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to acknowledge this warning' });
    }

    warning.status = 'Acknowledged';
    await warning.save();

    // Notify HR of acknowledgment
    const notif = await Notification.create({
      type: 'reminder',
      title: 'Warning Letter Acknowledged',
      desc: `${req.user.name} (${req.user.id}) has acknowledged their warning letter for "${warning.subject}".`,
      empId: 'hr'
    });

    req.io.to('hr').emit('notification', notif);

    res.json(warning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
