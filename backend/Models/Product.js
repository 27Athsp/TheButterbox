const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  imageURL: { type: String, required: true },
  veg: { type: Boolean, default: true },
  description: { type: String, default: '' },
  ingredients: { type: [String], default: [] },
  weight: { type: String },
  stock: { type: Number, default: 0 },
  bakerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approved: { type: Boolean, default: false },
  visible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
