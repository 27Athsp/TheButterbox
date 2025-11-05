const express = require('express');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/products?veg=true&sort=price_asc|price_desc
router.get('/', async (req, res) => {
  try {
    const { veg, sort } = req.query;
    const query = { approved: true, visible: true };
    if (veg === 'true') query.veg = true;
    let productsQuery = Product.find(query);
    if (sort === 'price_asc') productsQuery = productsQuery.sort({ price: 1 });
    if (sort === 'price_desc') productsQuery = productsQuery.sort({ price: -1 });
    const products = await productsQuery.limit(100);
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.visible) return res.status(404).json({ message: 'Not found' });
    // For non-bakers/admins, only show approved products
    if (!product.approved) return res.status(404).json({ message: 'Not found' });
    return res.json(product);
  } catch (err) {
    return res.status(404).json({ message: 'Not found' });
  }
});

// Baker: create
router.post('/', requireAuth, requireRole('baker'), async (req, res) => {
  try {
    const body = req.body || {};
    const product = await Product.create({
      name: body.name,
      price: body.price,
      imageURL: body.imageURL,
      veg: body.veg,
      description: body.description,
      ingredients: body.ingredients,
      weight: body.weight,
      stock: body.stock,
      bakerId: req.user.id,
      approved: false,
      visible: true
    });
    return res.status(201).json(product);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid product data' });
  }
});

// Baker: update own product
router.put('/:id', requireAuth, requireRole('baker'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (String(product.bakerId) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const updates = req.body;
    Object.assign(product, updates);
    // Any edit requires re-approval
    product.approved = false;
    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(400).json({ message: 'Update failed' });
  }
});

// Baker: delete own product
router.delete('/:id', requireAuth, requireRole('baker'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (String(product.bakerId) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await product.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ message: 'Delete failed' });
  }
});

// Baker: toggle visibility
router.patch('/:id/visibility', requireAuth, requireRole('baker'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (String(product.bakerId) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    product.visible = !!req.body.visible;
    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(400).json({ message: 'Update failed' });
  }
});

// Baker: get my products
router.get('/my', requireAuth, requireRole('baker'), async (req, res) => {
  try {
    const products = await Product.find({ bakerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(products);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Admin: approve product
router.patch('/:id/approve', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    product.approved = true;
    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(400).json({ message: 'Approve failed' });
  }
});

module.exports = router;
