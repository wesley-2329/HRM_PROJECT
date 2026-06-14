const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user alerts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let notifications;
    if (req.user.role === 'hr') {
      notifications = await Notification.find({
        $or: [{ empId: req.user.id }, { empId: '' }, { empId: 'hr' }]
      }).sort({ createdAt: -1 });
    } else {
      notifications = await Notification.find({
        $or: [{ empId: req.user.id }, { empId: '' }]
      }).sort({ createdAt: -1 });
    }
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all read
// @access  Private
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { empId: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
