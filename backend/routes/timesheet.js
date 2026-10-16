const express = require('express');
const router = express.Router();
const Timesheet = require('../models/Timesheet');
const { protect } = require('../middleware/auth');

// @route   GET /api/timesheet
// @desc    Get timesheet logs
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const now = new Date();

    // Auto-close any stale active shifts running > 16 hours (preserves genuine overnight shifts)
    const staleQuery = req.user.role === 'hr'
      ? { status: 'Active Shift' }
      : { empId: req.user.id, status: 'Active Shift' };

    const activeShifts = await Timesheet.find(staleQuery);
    for (const stale of activeShifts) {
      const cIn = stale.clockIn ? new Date(stale.clockIn) : new Date(stale.createdAt || now);
      const elapsedHours = (now.getTime() - cIn.getTime()) / (1000 * 60 * 60);
      if (elapsedHours > 16) {
        stale.clockOut = new Date(cIn.getTime() + 16 * 60 * 60 * 1000);
        stale.hours = 0; // Unsafe to fabricate 8h without supervisor regularization
        stale.status = 'Logged Out';
        stale.remarks = 'Auto-closed unclosed shift (>16h); supervisor regularization required';
        await stale.save();
      }
    }

    let logs;
    if (req.user.role === 'hr') {
      logs = await Timesheet.find({}).sort({ createdAt: -1 });
    } else {
      logs = await Timesheet.find({ empId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(logs);
  } catch (error) { next(error); }
});

// Helper to parse clockIn/clockOut gracefully (supports "00:47" string, ISO string, or Date)
const parseTimeString = (val, dateStr) => {
  if (!val) return new Date();
  if (typeof val === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(val.trim())) {
    const parts = val.trim().split(':');
    const baseDate = dateStr ? new Date(dateStr) : new Date();
    baseDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parts[2] ? parseInt(parts[2], 10) : 0, 0);
    return !isNaN(baseDate.getTime()) ? baseDate : new Date();
  }
  const parsed = new Date(val);
  return !isNaN(parsed.getTime()) ? parsed : new Date();
};

// @route   POST /api/timesheet/clock-in
// @desc    Clock-In shift
// @access  Private
router.post('/clock-in', protect, async (req, res, next) => {
  const now = new Date();
  const todayDate = req.body.date || now.toISOString().split('T')[0];
  const clockInTime = parseTimeString(req.body.clockIn, todayDate);

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
        // Safe auto-closure of previous day's shift
        const cIn = activeShift.clockIn ? new Date(activeShift.clockIn) : new Date(activeShift.createdAt || now);
        const elapsedHours = (now.getTime() - cIn.getTime()) / (1000 * 60 * 60);
        activeShift.clockOut = now;
        if (elapsedHours > 16) {
          activeShift.hours = 0;
          activeShift.remarks = 'Auto-closed unclosed shift (>16h); supervisor regularization required';
        } else {
          activeShift.hours = parseFloat(Math.max(0, elapsedHours).toFixed(2));
          activeShift.remarks = 'Closed upon start of subsequent shift';
        }
        activeShift.status = 'Logged Out';
        await activeShift.save();
      }
    }

    const shift = await Timesheet.create({
      date: todayDate,
      clockIn: clockInTime,
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
router.post('/clock-out', protect, async (req, res, next) => {
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
    const clockOutTime = req.body.clockOut ? parseTimeString(req.body.clockOut, activeShift.date) : now;
    const clockInDate = new Date(activeShift.clockIn);
    
    let hoursWorked = 0;
    if (!isNaN(clockInDate.getTime()) && !isNaN(clockOutTime.getTime())) {
      const diffMs = clockOutTime.getTime() - clockInDate.getTime();
      hoursWorked = parseFloat(Math.max(0, diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    activeShift.clockOut = clockOutTime;
    activeShift.hours = hoursWorked;
    activeShift.status = hoursWorked >= 8 ? 'Punctual' : 'Early Out';
    
    await activeShift.save();
    res.json(activeShift);
  } catch (error) { next(error); }
});

module.exports = router;
