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
  const todayDate = new Date().toISOString().split('T')[0];

  try {
    // Check if already clocked in today without clocking out
    const activeShift = await Timesheet.findOne({
      empId: req.user.id,
      date: todayDate,
      clockOut: ''
    });

    if (activeShift) {
      return res.status(400).json({ message: 'You have an active shift already running.' });
    }

    const clockInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  const todayDate = new Date().toISOString().split('T')[0];

  try {
    // Find active shift
    const activeShift = await Timesheet.findOne({
      empId: req.user.id,
      clockOut: ''
    });

    if (!activeShift) {
      return res.status(400).json({ message: 'No active shift found to clock out.' });
    }

    const clockOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Parse times to calculate hours
    const [inHrs, inMins] = activeShift.clockIn.split(' ')[0].split(':').map(Number);
    const inPeriod = activeShift.clockIn.split(' ')[1];
    
    const [outHrs, outMins] = clockOutTime.split(' ')[0].split(':').map(Number);
    const outPeriod = clockOutTime.split(' ')[1];
    
    let inHrs24 = inHrs;
    if (inPeriod === 'PM' && inHrs !== 12) inHrs24 += 12;
    if (inPeriod === 'AM' && inHrs === 12) inHrs24 = 0;
    
    let outHrs24 = outHrs;
    if (outPeriod === 'PM' && outHrs !== 12) outHrs24 += 12;
    if (outPeriod === 'AM' && outHrs === 12) outHrs24 = 0;
    
    const inMinutesTotal = inHrs24 * 60 + inMins;
    const outMinutesTotal = outHrs24 * 60 + outMins;
    
    let diffMinutes = outMinutesTotal - inMinutesTotal;
    if (diffMinutes < 0) {
      // Shift spanned across midnight
      diffMinutes += 24 * 60;
    }
    
    const hoursWorked = parseFloat((diffMinutes / 60).toFixed(2));

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
