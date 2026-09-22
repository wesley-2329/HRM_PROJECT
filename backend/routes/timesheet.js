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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/timesheet/clock-in
// @desc    Clock-In shift
// @access  Private
router.post('/clock-in', protect, async (req, res) => {
  const todayDate = req.body.date || new Date().toLocaleDateString('en-CA');

  try {
    // Check if already clocked in (active shift without clockOut)
    const activeShift = await Timesheet.findOne({
      empId: req.user.id,
      $or: [{ clockOut: '' }, { clockOut: { $exists: false } }, { status: 'Active Shift' }]
    });

    if (activeShift) {
      return res.status(400).json({ message: 'You have an active shift already running.' });
    }

    const clockInTime = req.body.clockIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const shift = await Timesheet.create({
      date: todayDate,
      clockIn: clockInTime,
      clockOut: '',
      hours: 0,
      status: 'Active Shift',
      empId: req.user.id
    });

    res.status(201).json(shift);
  } catch (error) {
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
      $or: [{ clockOut: '' }, { clockOut: { $exists: false } }, { status: 'Active Shift' }]
    });

    if (!activeShift) {
      return res.status(400).json({ message: 'No active shift found to clock out.' });
    }

    const clockOutTime = req.body.clockOut || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let hoursWorked = 0;
    if (activeShift.createdAt) {
      const diffMs = new Date() - new Date(activeShift.createdAt);
      hoursWorked = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    } else {
      const cleanIn = activeShift.clockIn.replace(/[.]/g, ':').trim();
      const cleanOut = clockOutTime.replace(/[.]/g, ':').trim();

      const matchIn = cleanIn.match(/^(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?$/i);
      const matchOut = cleanOut.match(/^(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?$/i);

      if (matchIn && matchOut) {
        let inHrs = parseInt(matchIn[1], 10);
        const inMins = parseInt(matchIn[2], 10);
        if (matchIn[4]) {
          if (matchIn[4].toUpperCase() === 'PM' && inHrs !== 12) inHrs += 12;
          if (matchIn[4].toUpperCase() === 'AM' && inHrs === 12) inHrs = 0;
        }

        let outHrs = parseInt(matchOut[1], 10);
        const outMins = parseInt(matchOut[2], 10);
        if (matchOut[4]) {
          if (matchOut[4].toUpperCase() === 'PM' && outHrs !== 12) outHrs += 12;
          if (matchOut[4].toUpperCase() === 'AM' && outHrs === 12) outHrs = 0;
        }

        let diffMinutes = (outHrs * 60 + outMins) - (inHrs * 60 + inMins);
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        hoursWorked = parseFloat((diffMinutes / 60).toFixed(2));
      }
    }

    activeShift.clockOut = clockOutTime;
    activeShift.hours = hoursWorked;
    activeShift.status = hoursWorked >= 8 ? 'Punctual' : 'Early Out';
    
    await activeShift.save();
    res.json(activeShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
