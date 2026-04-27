const express = require('express');
const router = express.Router();
const {
  register,
  login,
  registerRenter,
  registerLender,
  loginRenter,
  loginLender,
  getProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/signup', register);
router.post('/signin', login);
router.post('/renter/register', registerRenter);
router.post('/renter/login', loginRenter);
router.post('/lender/register', registerLender);
router.post('/lender/login', loginLender);
router.get('/profile', protect, getProfile);

module.exports = router;
