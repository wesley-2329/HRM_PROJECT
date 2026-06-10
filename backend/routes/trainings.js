const express = require('express');
const router = express.Router();
const Training = require('../models/Training');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/trainings
// @desc    Get training progress logs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let trainings;
    if (req.user.role === 'hr') {
      trainings = await Training.find({});
    } else {
      trainings = await Training.find({ empId: req.user.id });
    }
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/trainings
// @desc    Assign training course to employee
// @access  Private/HR only
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, deadline, category, duration, empId } = req.body;

  try {
    const training = await Training.create({
      name,
      assignedBy: req.user.name,
      deadline,
      progress: 0,
      category,
      duration,
      rating: 0,
      empId,
      status: 'assigned'
    });

    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/trainings/:id/progress
// @desc    Update learning course progress
// @access  Private
router.put('/:id/progress', protect, async (req, res) => {
  const { progress } = req.body;

  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: 'Training record not found' });
    }

    if (training.empId !== req.user.id && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    training.progress = progress;
    if (progress >= 100) {
      training.status = 'attended';
      training.certificate = 'Yes';
      training.date = new Date().toISOString().split('T')[0];
    }

    await training.save();
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/trainings/:id/review
// @desc    Add review/rating for completed training
// @access  Private
router.put('/:id/review', protect, async (req, res) => {
  const { rating, review, trainer } = req.body;

  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: 'Training record not found' });
    }

    if (training.empId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    training.rating = rating;
    training.review = review;
    if (trainer) training.trainer = trainer;

    await training.save();
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
