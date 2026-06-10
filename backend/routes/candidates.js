const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { protect, adminOnly } = require('../middleware/auth');

// All candidate routes are HR Director only
router.use(protect, adminOnly);

// @route   GET /api/candidates
// @desc    Get all candidates
// @access  HR Director Only
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/candidates
// @desc    Add a candidate (Walk-In or job application)
// @access  HR Director Only
router.post('/', async (req, res) => {
  const { name, role, source, experience, notes } = req.body;

  try {
    const candidate = await Candidate.create({
      name,
      role,
      source: source || 'Walk-In',
      experience,
      notes: notes || '',
      stage: 'applied',
      offerReleased: 'No'
    });

    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/candidates/:id/stage
// @desc    Update candidate stage
// @access  HR Director Only
router.put('/:id/stage', async (req, res) => {
  const { stage, stageRejectedAt, rejectionReason, interviewStage } = req.body;

  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    candidate.stage = stage || candidate.stage;
    if (stageRejectedAt !== undefined) candidate.stageRejectedAt = stageRejectedAt;
    if (rejectionReason !== undefined) candidate.rejectionReason = rejectionReason;
    if (interviewStage !== undefined) candidate.interviewStage = interviewStage;

    await candidate.save();
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/candidates/:id/offer
// @desc    Release offer letter
// @access  HR Director Only
router.put('/:id/offer', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    candidate.offerReleased = 'Yes';
    await candidate.save();
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Remove candidate record
// @access  HR Director Only
router.delete('/:id', async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
