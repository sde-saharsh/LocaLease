const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Load routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);

// Serve uploads statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the RentalApp API' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('--- Database Setup ---');
    const uri = process.env.MONGO_URI;
    
    if (uri && !uri.includes('your_mongodb_uri')) {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(uri);
      console.log('✅ MongoDB Atlas Connected Successfully!');
    } else {
      console.log('⚠️ No valid MONGO_URI found in .env. Falling back to In-Memory MongoDB.');
      console.log('Starting In-Memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('✅ In-Memory MongoDB Connected');
    }
    
    // Seed initial admin for demo
    const User = require('./models/User');
    const seedEmail = 'admin@renthub.com';
    const seedPassword = 'admin@123';
    
    const existingUser = await User.findOne({ email: seedEmail });
    if (!existingUser) {
      console.log(`🌱 Seeding demo admin: ${seedEmail}`);
      await User.create({
        name: 'Admin User',
        email: seedEmail,
        password: seedPassword,
        role: 'admin',
        phone: '0000000000'
      });
      console.log(`✅ Demo admin seeded successfully.`);
    }
    console.log('-----------------------');
  } catch (error) {
    console.error('❌ Failed to setup database:', error.message);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
