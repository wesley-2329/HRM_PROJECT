const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/leaves
// @desc    Get all leaves (HR sees all, Employee sees own)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let leaves;
    if (req.user.role === 'hr') {
      leaves = await Leave.find({}).sort({ createdAt: -1 });
    } else {
      leaves = await Leave.find({ empId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/leaves
// @desc    Apply for leave
// @access  Private
router.post('/', protect, async (req, res) => {
  const { type, start, end, reason } = req.body;

  try {
    const leave = await Leave.create({
      empId: req.user.id,
      empName: req.user.name,
      type,
      start,
      end,
      reason,
      status: 'Pending'
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/leaves/:id
// @desc    Approve or Reject leave request
// @access  Private/HR only
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Cancel/delete a pending leave request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if owner
    if (leave.empId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only delete pending leave applications' });
    }

    await Leave.deleteOne({ _id: req.params.id });
    res.json({ message: 'Leave application cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
