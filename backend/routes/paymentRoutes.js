const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

let instance;
try {
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
  });
} catch (err) {
  console.error('Razorpay initialization error:', err.message);
}

// Create Razorpay order (amount in INR rupees from client -> converted to paise)
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    if (!instance || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }
    const { amount, receipt } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const options = {
      amount: Math.round(Number(amount) * 100), // paise
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`
    };
    const order = await instance.orders.create(options);
    return res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// Verify payment signature sent from frontend after checkout
router.post('/verify', requireAuth, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment params' });
    }
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expected = hmac.digest('hex');
    const verified = expected === razorpay_signature;
    if (!verified) return res.status(400).json({ success: false, message: 'Signature mismatch' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

module.exports = router;
