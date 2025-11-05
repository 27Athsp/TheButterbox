const express = require('express');
const Feedback = require('../models/Feedback');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    return res.status(201).json(feedback);
  } catch {
    return res.status(400).json({ message: 'Failed to submit feedback' });
  }
});

router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    return res.json(feedback);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

