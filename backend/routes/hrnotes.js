const express = require('express');
const router = express.Router();
const ConfidentialNote = require('../models/ConfidentialNote');
const { protect, adminOnly } = require('../middleware/auth');

// All notepad routes are restricted to HR only
router.use(protect, adminOnly);

// @route   GET /api/hr-notes
// @desc    Get all HR confidential notes
// @access  HR Only
router.get('/', async (req, res) => {
  try {
    const notes = await ConfidentialNote.find({}).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/hr-notes
// @desc    Create a confidential note
// @access  HR Only
router.post('/', async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const note = await ConfidentialNote.create({
      title,
      content,
      category: category || 'General',
      authorId: req.user.id
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/hr-notes/:id
// @desc    Update a confidential note
// @access  HR Only
router.put('/:id', async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const note = await ConfidentialNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Confidential note not found' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/hr-notes/:id
// @desc    Delete a confidential note
// @access  HR Only
router.delete('/:id', async (req, res) => {
  try {
    const note = await ConfidentialNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Confidential note not found' });
    }

    await ConfidentialNote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Confidential note removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
