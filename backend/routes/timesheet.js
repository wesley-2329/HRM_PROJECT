const express = require('express');
const router = express.Router();
const Timesheet = require('../models/Timesheet');
const { protect } = require('../middleware/auth');

// Helper to parse clockIn/clockOut gracefully (supports "00:47" string, ISO string, Date, or createdAt)
const parseTimeString = (val, dateStr, createdAt) => {
  if (!val) {
    if (createdAt && !isNaN(new Date(createdAt).getTime())) {
      return new Date(createdAt);
    }
    if (dateStr && !isNaN(new Date(dateStr).getTime())) {
      return new Date(dateStr);
    }
    return new Date();
  }
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) return val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i;
    const match = trimmed.match(timeRegex);
    if (match) {
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const secs = match[3] ? parseInt(match[3], 10) : 0;
      const meridiem = match[4] ? match[4].toUpperCase() : null;
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const baseDate = dateStr && !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : new Date();
      baseDate.setHours(hours, mins, secs, 0);
      if (!isNaN(baseDate.getTime())) return baseDate;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (createdAt && !isNaN(new Date(createdAt).getTime())) {
    return new Date(createdAt);
  }
  return new Date();
};

// @route   GET /api/timesheet
// @desc    Get timesheet logs
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const now = new Date();
    const userConditions = req.user.role === 'hr'
      ? {}
      : { $or: [{ empId: req.user.id }, { empId: req.user._id }] };

    // Auto-close any stale active shifts running > 16 hours or from previous days
    const staleQuery = { ...userConditions, status: 'Active Shift' };
    const activeShifts = await Timesheet.find(staleQuery);
    for (const stale of activeShifts) {
      const cIn = parseTimeString(stale.clockIn, stale.date, stale.createdAt);
      stale.clockIn = cIn;
      const elapsedHours = (now.getTime() - cIn.getTime()) / (1000 * 60 * 60);
      const isPastDate = stale.date && stale.date < now.toISOString().split('T')[0];
      if (elapsedHours > 16 || isPastDate) {
        stale.clockOut = new Date(Math.min(now.getTime(), cIn.getTime() + 8 * 60 * 60 * 1000));
        stale.hours = elapsedHours <= 16 ? parseFloat(Math.max(0, elapsedHours).toFixed(2)) : 0;
        stale.status = 'Logged Out';
        stale.remarks = 'Auto-closed unclosed shift (>16h); supervisor regularization required';
        await stale.save();
      }
    }

    let logs;
    if (req.user.role === 'hr') {
      logs = await Timesheet.find({}).sort({ createdAt: -1 });
    } else {
      logs = await Timesheet.find(userConditions).sort({ createdAt: -1 });
    }
    res.json(logs);
  } catch (error) { next(error); }
});

// @route   POST /api/timesheet/clock-in
// @desc    Clock-In shift
// @access  Private
router.post('/clock-in', protect, async (req, res, next) => {
  const now = new Date();
  const todayDate = req.body.date || now.toISOString().split('T')[0];
  const clockInTime = parseTimeString(req.body.clockIn, todayDate);
  const userConditions = { $or: [{ empId: req.user.id }, { empId: req.user._id }] };

  try {
    // 1. Auto-close any prior active shifts from previous dates or running > 16 hours
    const staleShifts = await Timesheet.find({
      ...userConditions,
      status: 'Active Shift'
    });

    for (const activeShift of staleShifts) {
      if (activeShift.date === todayDate) {
        const cIn = parseTimeString(activeShift.clockIn, activeShift.date, activeShift.createdAt);
        const elapsedHours = (now.getTime() - cIn.getTime()) / (1000 * 60 * 60);
        if (elapsedHours <= 16) {
          activeShift.clockIn = cIn;
          return res.status(409).json({
            message: 'You have an active shift already running for today.',
            activeShift
          });
        }
      }
      // Stale shift from prior date or running > 16 hours -> auto close cleanly
      const cIn = parseTimeString(activeShift.clockIn, activeShift.date, activeShift.createdAt);
      activeShift.clockIn = cIn;
      activeShift.clockOut = now;
      activeShift.hours = 0;
      activeShift.remarks = 'Auto-closed stale shift upon new clock in';
      activeShift.status = 'Logged Out';
      await activeShift.save();
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
          ...userConditions,
          status: 'Active Shift'
        });
        if (existingShift) {
          existingShift.clockIn = parseTimeString(existingShift.clockIn, existingShift.date, existingShift.createdAt);
        }
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
    const userConditions = { $or: [{ empId: req.user.id }, { empId: req.user._id }] };
    const activeShift = await Timesheet.findOne({
      ...userConditions,
      status: 'Active Shift'
    });

    if (!activeShift) {
      return res.status(400).json({ message: 'No active shift found to clock out.' });
    }

    const now = new Date();
    const clockOutTime = req.body.clockOut ? parseTimeString(req.body.clockOut, activeShift.date) : now;
    activeShift.clockIn = parseTimeString(activeShift.clockIn, activeShift.date, activeShift.createdAt);
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
