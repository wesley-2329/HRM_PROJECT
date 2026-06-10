const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/tickets
// @desc    Get tickets list
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === 'hr') {
      tickets = await Ticket.find({}).sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ empId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tickets
// @desc    Raise a support ticket
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, category, priority, description } = req.body;

  try {
    const ticketCount = await Ticket.countDocuments();
    const ticketId = `TCK-${100 + ticketCount + 1}`;

    const ticket = await Ticket.create({
      id: ticketId,
      title,
      category,
      priority: priority || 'Low',
      status: 'Open',
      raisedOn: new Date().toISOString().split('T')[0],
      empId: req.user.id,
      response: ''
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tickets/:id
// @desc    Respond to/Close ticket
// @access  Private/HR only
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { response, status } = req.body;

  try {
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (response !== undefined) {
      ticket.response = response;
    }
    if (status !== undefined) {
      ticket.status = status;
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
