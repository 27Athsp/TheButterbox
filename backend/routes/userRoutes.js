const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json(user);
  } catch {
    return res.status(404).json({ message: 'User not found' });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.name) user.name = req.body.name;
    await user.save();
    return res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch {
    return res.status(400).json({ message: 'Update failed' });
  }
});

router.post('/address', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();
    return res.json(user.addresses);
  } catch {
    return res.status(400).json({ message: 'Failed to save address' });
  }
});

router.get('/customers', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    return res.json(customers);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bakers', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const bakers = await User.find({ role: 'baker' }).select('-password');
    const withProducts = await Promise.all(bakers.map(async (baker) => {
      const products = await Product.find({ bakerId: baker._id });
      return { ...baker.toObject(), products };
    }));
    return res.json(withProducts);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

