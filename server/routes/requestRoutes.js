const express = require('express');
const router = express.Router();
const { createRequest, getRequests, getMyRequests, getLenderRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRequests)
  .post(protect, createRequest);

router.get('/my', protect, getMyRequests);
router.get('/lender', protect, getLenderRequests);
router.put('/:id', protect, updateRequestStatus);

module.exports = router;
