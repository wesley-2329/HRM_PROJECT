const express = require('express');
const router = express.Router();
const DiscussionMessage = require('../models/DiscussionMessage');
const { protect } = require('../middleware/auth');

// @route   GET /api/discussion
// @desc    Get all group discussion messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await DiscussionMessage.find({}).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/discussion
// @desc    Post a new group discussion message
// @access  Private
router.post('/', protect, async (req, res) => {
  const { message } = req.body;

  try {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMsg = await DiscussionMessage.create({
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role === 'hr' ? 'HR Director' : req.user.role,
      senderAvatar: req.user.avatar || '',
      message,
      time: timeStr
    });

    // Broadcast message to all connected clients in real-time
    req.io.emit('discussion_message', newMsg);

    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
