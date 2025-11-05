// backend/server.js
const authRoutes = require('./routes/authRoutes');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const envPath = path.join(__dirname, '.env');
const dbEnvPath = path.join(__dirname, 'db.env');
let loadedEnvPath = null;
if (require('fs').existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  loadedEnvPath = envPath;
} else if (require('fs').existsSync(dbEnvPath)) {
  require('dotenv').config({ path: dbEnvPath });
  loadedEnvPath = dbEnvPath;
}
console.log(`Env loaded from: ${loadedEnvPath || 'none'}`);

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI (set it in backend/.env or backend/db.env)');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error", err));

app.get("/", (req, res) => {
  res.send("Bakery Marketplace API Running");
});

app.use('/api/auth', authRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);
const couponRoutes = require('./routes/couponRoutes');
app.use('/api/coupons', couponRoutes);
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedback', feedbackRoutes);

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
