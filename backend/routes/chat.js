const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { protect } = require('../middleware/auth');

// @route   GET /api/chat
// @desc    Get support chat history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ empId: req.user.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/chat
// @desc    Send helpdesk message & generate bot response
// @access  Private
router.post('/', protect, async (req, res) => {
  const { message } = req.body;

  try {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Save user message
    const userMsg = await ChatMessage.create({
      sender: 'emp',
      message,
      time: timeStr,
      empId: req.user.id
    });

    // Generate response (simulated AI bot reply)
    let replyText = "This is an automated HR support notification. A representative will get back to you shortly.";
    if (message.toLowerCase().includes('salary') || message.toLowerCase().includes('appraisal')) {
      replyText = "Salary pay cycle disbursements occur on the 1st of every month. For specific appraisal results, please connect directly with your reporting manager.";
    } else if (message.toLowerCase().includes('leave') || message.toLowerCase().includes('holiday')) {
      replyText = "Standard leaves can be applied through the Attendance tab. Earned leaves require manager review 1 week in advance.";
    } else if (message.toLowerCase().includes('policy')) {
      replyText = "You can view all current corporate guidelines under the Company Policies tab.";
    }

    const botMsg = await ChatMessage.create({
      sender: 'hr',
      message: replyText,
      time: timeStr,
      empId: req.user.id
    });

    res.status(201).json({ userMsg, botMsg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
