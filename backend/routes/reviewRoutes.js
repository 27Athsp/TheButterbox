const express = require('express');
const Review = require('../models/Review');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/my', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).populate('productId').sort({ createdAt: -1 });
    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/baker', requireAuth, requireRole('baker'), async (req, res) => {
  try {
    const Product = require('../models/Product');
    const myProducts = await Product.find({ bakerId: req.user.id }).select('_id');
    const productIds = myProducts.map(p => p._id);
    const reviews = await Review.find({ productId: { $in: productIds } }).populate('productId').populate('userId', 'name').sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const reviews = await Review.find().populate('productId').populate('userId', 'name').sort({ createdAt: -1 });
    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/approved', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).populate('productId').populate('userId', 'name').sort({ createdAt: -1 }).limit(8);
    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/approve', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    review.approved = true;
    await review.save();
    return res.json(review);
  } catch {
    return res.status(400).json({ message: 'Approve failed' });
  }
});

module.exports = router;

