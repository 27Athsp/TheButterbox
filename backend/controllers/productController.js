const Product = require("/models/Product");

// Create Product (Baker Only)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, imageURL, veg, description, ingredients, weight, stock } = req.body;
    const bakerId = req.user.id; // Must be from JWT auth middleware

    const product = new Product({ name, price, imageURL, veg, description, ingredients, weight, stock, bakerId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Cannot create product" });
  }
};

// Get All Products (with filters/sorting)
exports.getProducts = async (req, res) => {
  const { sort, veg } = req.query;
  let query = { approved: true };

  if (veg === 'true') query.veg = true;

  let products = await Product.find(query);

  // Sort
  if (sort === 'low') products = products.sort((a, b) => a.price - b.price);
  if (sort === 'high') products = products.sort((a, b) => b.price - a.price);

  res.json(products);
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ error: "Product not found" });
    res.json(prod);
  } catch {
    res.status(500).json({ error: "Invalid product ID" });
  }
};

// Update Product (Baker only)
exports.updateProduct = async (req, res) => {
  try {
    const prod = await Product.findOneAndUpdate(
      { _id: req.params.id, bakerId: req.user.id },
      req.body,
      { new: true }
    );
    if (!prod) return res.status(404).json({ error: "Product not found or unauthorized" });
    res.json(prod);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

// Delete Product (Baker only)
exports.deleteProduct = async (req, res) => {
  try {
    const prod = await Product.findOneAndDelete({ _id: req.params.id, bakerId: req.user.id });
    if (!prod) return res.status(404).json({ error: "Product not found or unauthorized" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Deletion failed" });
  }
};
