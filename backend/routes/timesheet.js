const express = require('express');
const router = express.Router();
const Timesheet = require('../models/Timesheet');
const { protect } = require('../middleware/auth');

// @route   GET /api/timesheet
// @desc    Get timesheet logs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let logs;
    if (req.user.role === 'hr') {
      logs = await Timesheet.find({}).sort({ createdAt: -1 });
    } else {
      logs = await Timesheet.find({ empId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(logs);
  } catch (error) { next(error); }
});

// @route   POST /api/timesheet/clock-in
// @desc    Clock-In shift
// @access  Private
router.post('/clock-in', protect, async (req, res) => {
  const now = new Date();
  const todayDate = req.body.date || now.toISOString().split('T')[0];

  try {
    // Check if already clocked in (active shift)
    const activeShift = await Timesheet.findOne({
      empId: req.user.id,
      status: 'Active Shift'
    });

    if (activeShift) {
      if (activeShift.date === todayDate) {
        return res.status(409).json({
          message: 'You have an active shift already running for today.',
          activeShift
        });
      } else {
        // Auto-close stale active shift from a previous calendar day
        const autoOutTime = new Date(new Date(activeShift.clockIn).getTime() + 8 * 60 * 60 * 1000);
        activeShift.clockOut = autoOutTime;
        activeShift.hours = 8;
        activeShift.status = 'Logged Out';
        await activeShift.save();
      }
    }

    const shift = await Timesheet.create({
      date: todayDate,
      clockIn: now,
      clockOut: null,
      hours: 0,
      status: 'Active Shift',
      empId: req.user.id
    });

    res.status(201).json(shift);
  } catch (error) {
    // Catch MongoDB E11000 duplicate key error on partial unique index { empId: 1, status: 'Active Shift' }
    if (error.code === 11000 || error.name === 'MongoServerError') {
      try {
        const existingShift = await Timesheet.findOne({
          empId: req.user.id,
          status: 'Active Shift'
        });
        return res.status(409).json({
          message: 'You have an active shift already running for today.',
          activeShift: existingShift
        });
      } catch (e) {
        return res.status(409).json({ message: 'You have an active shift already running for today.' });
      }
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/timesheet/clock-out
// @desc    Clock-Out shift
// @access  Private
router.post('/clock-out', protect, async (req, res) => {
  try {
    // Find active shift
    const activeShift = await Timesheet.findOne({
      empId: req.user.id,
      status: 'Active Shift'
    });

    if (!activeShift) {
      return res.status(400).json({ message: 'No active shift found to clock out.' });
    }

    const now = new Date();
    const clockInDate = new Date(activeShift.clockIn);
    
    let hoursWorked = 0;
    if (!isNaN(clockInDate.getTime())) {
      const diffMs = now.getTime() - clockInDate.getTime();
      hoursWorked = parseFloat(Math.max(0, diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    activeShift.clockOut = now;
    activeShift.hours = hoursWorked;
    activeShift.status = hoursWorked >= 8 ? 'Punctual' : 'Early Out';
    
    await activeShift.save();
    res.json(activeShift);
  } catch (error) { next(error); }
});

module.exports = router;
