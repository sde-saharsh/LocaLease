const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getLenderRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getLenderRequests) // or getMyRequests, depending on need
  .post(protect, createRequest);

router.get('/my', protect, getMyRequests);
router.get('/lender', protect, getLenderRequests);
router.put('/:id', protect, updateRequestStatus);

module.exports = router;
