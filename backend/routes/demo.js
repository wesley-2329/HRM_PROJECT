const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/demo/reset — rebuilds the demo data. Exists only on a Preview deployment (or locally with
// DEMO_AUTO_SEED=true) connected to a *_demo database; everywhere else, including production, it is a 404.
router.post('/reset', protect, adminOnly, async (req, res, next) => {
  const demoEnv = process.env.VERCEL_ENV === 'preview' || process.env.DEMO_AUTO_SEED === 'true';
  if (!demoEnv || !(mongoose.connection.name || '').endsWith('_demo')) return res.status(404).json({ message: 'Not found' });
  try {
    const status = await require('../scripts/seed_demo').ensureDemoSeeded({ force: true });
    res.status(status === 'seeded' ? 200 : 409).json({ status });
  } catch (err) { next(err); }
});

module.exports = router;
