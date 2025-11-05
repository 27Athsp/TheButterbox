const express = require('express');
const Coupon = require('../models/Coupon');

const router = express.Router();

router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code || !amount) return res.status(400).json({ message: 'Missing fields' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.json({ valid: false });
    if (new Date(coupon.expiryDate) < new Date()) return res.json({ valid: false });
    if (amount < coupon.minAmount) return res.json({ valid: false, message: `Minimum amount ₹${coupon.minAmount} required` });
    return res.json({ valid: true, coupon });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

