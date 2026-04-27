const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerWithRole = async (req, res, next, forcedRole = null) => {
  try {
    const { name, email, password, phone, role } = req.body;
    console.log(`Registration attempt for: ${email}`);

    if (!name || !email || !password) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Registration failed: User ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const requestedRole = role || 'renter';
    const finalRole = forcedRole || requestedRole;

    // Never allow public self-registration as admin.
    if (finalRole === 'admin') {
      return res.status(403).json({ message: 'Admin registration is not allowed' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: finalRole,
    });

    if (user) {
      console.log(`User registered successfully: ${email}`);
      const token = generateToken(user._id);
      return res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      });
    }

    console.log('Registration failed: Database create returned null');
    return res.status(500).json({ message: 'Failed to create user' });
  } catch (error) {
    console.error('Register error details:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    return next(error);
  }
};

const loginWithRole = async (req, res, next, expectedRole = null) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User ${email} not found`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userRole = user.role === 'user' ? 'renter' : user.role;
    if (expectedRole && userRole !== expectedRole) {
      return res.status(403).json({
        message: `This is a ${expectedRole} portal. Please use your correct account.`,
      });
    }

    console.log(`Login successful: ${email}`);
    const token = generateToken(user._id);
    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Login error details:', error);
    return next(error);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  return registerWithRole(req, res, next, null);
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  return loginWithRole(req, res, next, null);
};

// Dedicated role-based endpoints
exports.registerRenter = async (req, res, next) => registerWithRole(req, res, next, 'renter');
exports.registerLender = async (req, res, next) => registerWithRole(req, res, next, 'lender');
exports.loginRenter = async (req, res, next) => loginWithRole(req, res, next, 'renter');
exports.loginLender = async (req, res, next) => loginWithRole(req, res, next, 'lender');

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
