const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function parseList(envVar) {
  return (process.env[envVar] || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'customer', roleId, addresses = [] } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });
    if (!['customer', 'baker', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    if (role === 'baker') {
      const valid = parseList('VALID_BAKER_IDS');
      if (!roleId || !valid.includes(roleId)) return res.status(403).json({ message: 'Access Denied' });
    }
    if (role === 'admin') {
      const valid = parseList('VALID_ADMIN_IDS');
      if (!roleId || !valid.includes(roleId)) return res.status(403).json({ message: 'Access Denied' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, roleId, addresses });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(200).json({ authenticated: false });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ authenticated: true, user: { id: payload.id, email: payload.email, name: payload.name, role: payload.role } });
  } catch (e) {
    return res.status(200).json({ authenticated: false });
  }
});

module.exports = router;
