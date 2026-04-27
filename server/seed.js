// seed.js – populate test data for RentalApp
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');
const Request = require('./models/Request'); // rental request model

// -----------------------------------------------------
// Helper to connect – uses real URI, falls back to in‑memory DB
const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed – switching to in‑memory server');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ In‑memory MongoDB connected');
  }
};

const seed = async () => {
  await connectDB();

  // Clean existing collections
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Request && Request.deleteMany({}), // safe‑guard if model exists
  ]);

  // ---------- Create Users ----------
  const lender = await User.create({
    name: 'Lena Lender',
    email: 'lena.lender@example.com',
    password: 'password123', // will be hashed by pre‑save hook
    role: 'lender',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  const renter = await User.create({
    name: 'Ravi Renter',
    email: 'ravi.renter@example.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  // ---------- Create Items (owned by lender) ----------
  const itemsData = [
    {
      title: 'Mountain Bike',
      description: 'A reliable mountain bike, perfect for trails.',
      price: 150,
      category: 'Vehicles',
      condition: 'Good',
      location: 'Mumbai, Maharashtra',
      deposit: 500,
      images: ['https://images.unsplash.com/photo-1518611012118-fd5e0b33a7c5?w=400'],
    },
    {
      title: 'Electric Drill',
      description: 'Cordless drill with multiple bits.',
      price: 40,
      category: 'Tools',
      condition: 'Like New',
      location: 'Pune, Maharashtra',
      deposit: 100,
      images: ['https://images.unsplash.com/photo-1586201375751-6a7d6cd71f2e?w=400'],
    },
    {
      title: 'DSLR Camera',
      description: 'Professional camera for high-quality photography.',
      price: 75,
      category: 'Electronics',
      condition: 'New',
      location: 'Bangalore, Karnataka',
      deposit: 1000,
      images: ['https://images.unsplash.com/photo-1504198266289-165cce0e5f5d?w=400'],
    },
  ];

  const createdItems = await Promise.all(
    itemsData.map((it) => Item.create({ ...it, owner: lender._id }))
  );

  // ---------- Create a sample rental request ----------
  // The renter requests the first item (Mountain Bike)
  if (Request) {
    await Request.create({
      item: createdItems[0]._id,
      renter: renter._id,
      lender: lender._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
      status: 'pending',
      totalPrice: createdItems[0].price,
    });
  }

  console.log('🌱 Seed data inserted');
  console.log('Lender →', lender.email);
  console.log('Renter →', renter.email);
  console.log('Items created →', createdItems.length);
  process.exit(0);
};

seed();
