const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { protect } = require('../middleware/auth');

// @route   GET /api/meetings
// @desc    Get all meetings
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let meetings = [];
    if (req.user && req.user.role === 'hr') {
      meetings = await Meeting.find({});
    } else if (req.user) {
      const rawId = String(req.user.id || req.user._id || '');
      const safeId = rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const userName = req.user.name || '';
      
      meetings = await Meeting.find({
        $or: [
          ...(userName ? [{ host: userName }] : []),
          ...(safeId ? [{ empId: { $regex: new RegExp(`\\b${safeId}\\b`, 'i') } }] : []),
          ...(rawId ? [{ empId: rawId }] : [])
        ]
      });
    }
    res.json(meetings || []);
  } catch (error) {
    console.error('Error fetching meetings:', error.message);
    res.json([]);
  }
});

// @route   POST /api/meetings
// @desc    Schedule a meeting
// @access  Private
router.post('/', protect, async (req, res, next) => {
  const { title, host, date, time, type, empId, link, agenda, fromTime, toTime, points, durationHours, attendeesCount, topics } = req.body;

  try {
    const meeting = await Meeting.create({
      title,
      host: host || req.user.name,
      date,
      time,
      type: type || 'Online',
      status: 'Scheduled',
      empId: empId || req.user.id,
      link: link || '',
      agenda: agenda || '',
      fromTime: fromTime || '',
      toTime: toTime || '',
      points: points || '',
      durationHours: durationHours || 0,
      attendeesCount: attendeesCount || 1,
      topics: topics || ''
    });

    // Notify all invited attendees
    const attendees = (empId || '').split(',').map(id => id.trim()).filter(Boolean);
    if (attendees.length > 0) {
      const Notification = require('../models/Notification');
      const senderName = host || req.user.name;
      for (const attId of attendees) {
        if (attId !== req.user.id) {
          const notif = await Notification.create({
            type: 'meeting',
            title: 'New Meeting Invite',
            desc: `You are invited to "${title}" on ${date} at ${time} by ${senderName}.`,
            empId: attId
          });
          req.io.to(attId).emit('notification', notif);
        }
      }
    }

    res.status(201).json(meeting);
  } catch (error) { next(error); }
});

// @route   PUT /api/meetings/:id/status
// @desc    Update meeting status
// @access  Private
router.put('/:id/status', protect, async (req, res, next) => {
  const { status, notes } = req.body;

  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (status) meeting.status = status;
    if (notes) meeting.notes = notes;

    await meeting.save();
    res.json(meeting);
  } catch (error) { next(error); }
});

module.exports = router;
