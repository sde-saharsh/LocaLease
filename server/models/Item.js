const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  priceUnit: { type: String, default: 'day' },
  category: { 
    type: String, 
    required: true,
    enum: ['Electronics', 'Furniture', 'Tools', 'Vehicles', 'Fashion', 'Others', 'Sports', 'Cameras', 'Music', 'Outdoors', 'Gaming']
  },
  condition: { 
    type: String, 
    required: true,
    enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair']
  },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
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
}, { timestamps: true });

itemSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Item', itemSchema);
