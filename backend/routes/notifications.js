const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Helper to calculate real-time human-readable timestamp
const formatRelativeTime = (createdAt) => {
  if (!createdAt) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

// @route   GET /api/notifications
// @desc    Get user alerts (excluding cleared items, with user-specific read status)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const empId = req.user.id;
    const isHR = ['hr', 'hr_admin', 'super_admin'].includes(req.user.role);

    const filter = {
      clearedBy: { $ne: empId }
    };

    if (isHR) {
      filter.$or = [
        { empId: empId },
        { empId: '' },
        { empId: null },
        { empId: 'hr' },
        { empId: 'all' }
      ];
    } else {
      filter.$or = [
        { empId: empId },
        { empId: '' },
        { empId: null },
        { empId: 'all' }
      ];
    }

    const rawNotifs = await Notification.find(filter).sort({ createdAt: -1 });

    const notifications = rawNotifs.map(n => {
      const doc = n.toObject ? n.toObject() : { ...n };
      const hasRead = (Array.isArray(doc.readBy) && doc.readBy.includes(empId));
      const isDirectRead = (doc.empId === empId && doc.read === true);
      const isRead = Boolean(hasRead || isDirectRead);
      return {
        ...doc,
        read: isRead,
        time: formatRelativeTime(doc.createdAt)
      };
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all visible alerts as read for current user
// @access  Private
router.put('/mark-all-read', protect, async (req, res, next) => {
  try {
    const empId = req.user.id;
    const isHR = ['hr', 'hr_admin', 'super_admin'].includes(req.user.role);

    // 1. Mark direct notifications as read in both the boolean and readBy array
    await Notification.updateMany(
      { empId: empId },
      { $set: { read: true }, $addToSet: { readBy: empId } }
    );

    // 2. Mark broadcast notifications as read for this user
    const broadcastFilter = {
      $or: isHR
        ? [{ empId: '' }, { empId: null }, { empId: 'all' }, { empId: 'hr' }]
        : [{ empId: '' }, { empId: null }, { empId: 'all' }]
    };

    await Notification.updateMany(
      broadcastFilter,
      { $addToSet: { readBy: empId } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a single notification as read for current user
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const empId = req.user.id;
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notif.empId === empId) {
      notif.read = true;
    }
    if (!Array.isArray(notif.readBy)) {
      notif.readBy = [];
    }
    if (!notif.readBy.includes(empId)) {
      notif.readBy.push(empId);
    }
    await notif.save();

    res.json({ message: 'Notification marked as read', id: notif._id });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/clear-all-read
// @desc    Clear all read notifications for current user
// @access  Private
router.delete('/clear-all-read', protect, async (req, res, next) => {
  try {
    const empId = req.user.id;
    const isHR = ['hr', 'hr_admin', 'super_admin'].includes(req.user.role);

    // 1. Delete direct notifications that are read
    await Notification.deleteMany({
      empId: empId,
      $or: [{ read: true }, { readBy: empId }]
    });

    // 2. Hide broadcast notifications that have been read by this user
    const broadcastFilter = {
      $or: isHR
        ? [{ empId: '' }, { empId: null }, { empId: 'all' }, { empId: 'hr' }]
        : [{ empId: '' }, { empId: null }, { empId: 'all' }],
      readBy: empId
    };

    await Notification.updateMany(
      broadcastFilter,
      { $addToSet: { clearedBy: empId } }
    );

    res.json({ message: 'All read notifications cleared' });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications (both read and unread) for current user
// @access  Private
router.delete('/clear-all', protect, async (req, res, next) => {
  try {
    const empId = req.user.id;
    // 1. Delete direct notifications
    await Notification.deleteMany({ empId: empId });

    // 2. Hide all broadcast notifications for this user
    await Notification.updateMany(
      {},
      { $addToSet: { clearedBy: empId, readBy: empId } }
    );

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Clear / delete a single notification
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const empId = req.user.id;
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notif.empId === empId) {
      await Notification.findByIdAndDelete(req.params.id);
    } else {
      await Notification.findByIdAndUpdate(req.params.id, {
        $addToSet: { clearedBy: empId, readBy: empId }
      });
    }

    res.json({ message: 'Notification cleared', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
