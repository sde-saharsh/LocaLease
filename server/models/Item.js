const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  priceUnit: { type: String, default: 'day' },
  category: { 
    type: String, 
    required: true,
    enum: ['Electronics', 'Furniture', 'Tools', 'Vehicles', 'Fashion', 'Others']
  },
  condition: { 
    type: String, 
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair']
  },
  location: { type: String, required: true },
  distance: { type: String, default: '0 km' },
  deposit: { type: Number, required: true },
  minRental: { type: Number, default: 1 },
  maxRental: { type: Number, default: 30 },
  images: [{ type: String }],
  features: [{ type: String }],
  rules: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  totalRentals: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
