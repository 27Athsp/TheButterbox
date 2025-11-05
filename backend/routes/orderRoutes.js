const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, totalAmount, addressSnapshot } = req.body;
    if (!items || !totalAmount) return res.status(400).json({ message: 'Missing required fields' });
    const firstProduct = await Product.findById(items[0].productId);
    if (!firstProduct) return res.status(400).json({ message: 'Invalid product' });
    const order = await Order.create({
      userId: req.user.id,
      bakerId: firstProduct.bakerId,
      items,
      totalAmount,
      addressSnapshot,
      status: 'baking'
    });
    return res.status(201).json(order);
  } catch {
    return res.status(400).json({ message: 'Failed to create order' });
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('items.productId').sort({ createdAt: -1 });
    return res.json(orders);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/baker', requireAuth, requireRole('baker'), async (req, res) => {
  try {
    const orders = await Order.find({ bakerId: req.user.id }).populate('items.productId').sort({ createdAt: -1 });
    return res.json(orders);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId').sort({ createdAt: -1 });
    return res.json(orders);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const userRole = req.user.role;
    if (userRole === 'baker' && String(order.bakerId) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (userRole === 'baker' && !['baking', 'baked'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status for baker' });
    if (userRole === 'admin' && order.status !== 'baked') return res.status(400).json({ message: 'Can only update baked orders' });
    order.status = req.body.status;
    await order.save();
    return res.json(order);
  } catch {
    return res.status(400).json({ message: 'Update failed' });
  }
});

module.exports = router;

