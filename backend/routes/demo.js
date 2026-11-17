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
  } catch (err) {
    console.error('[Demo] reset failed: ' + err.message);
    // The seed already retried. Signing in with a demo login rebuilds the data again.
    res.status(503).json({ status: 'failed', message: 'The demo reset did not finish. Please try again; signing in with a demo account also rebuilds it.' });
  }
});

module.exports = router;
