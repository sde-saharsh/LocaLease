const Request = require('../models/Request');
const Item = require('../models/Item');
const { formatItemImages, formatUserAvatar } = require('../utils/urlFormatter');

// @desc    Create rental request
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { itemId, startDate, endDate, totalPrice, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const request = await Request.create({
      item: itemId,
      renter: req.user.id,
      lender: item.owner,
      startDate,
      endDate,
      totalPrice,
      message,
    });

    console.log(`✅ Rental Request created for item: ${item.title}`);
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user requests (as renter)
// @route   GET /api/requests/my
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ renter: req.user.id })
      .populate('item', 'title images price')
      .populate('lender', 'name avatar')
      .sort('-createdAt');
      
    const formatted = requests.map(reqDoc => {
      const r = reqDoc.toObject();
      if (r.item) r.item = formatItemImages(r.item, req);
      if (r.lender) r.lender = formatUserAvatar(r.lender, req);
      return r;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get lender requests (as lender)
// @route   GET /api/requests/lender
exports.getLenderRequests = async (req, res) => {
  try {
    const requests = await Request.find({ lender: req.user.id })
      .populate('item', 'title images price')
      .populate('renter', 'name avatar')
      .sort('-createdAt');
      
    const formatted = requests.map(reqDoc => {
      const r = reqDoc.toObject();
      if (r.item) r.item = formatItemImages(r.item, req);
      if (r.renter) r.renter = formatUserAvatar(r.renter, req);
      return r;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get requests based on current user role
// @route   GET /api/requests
exports.getRequests = async (req, res) => {
  if (req.user.role === 'lender' || req.user.role === 'admin') {
    return exports.getLenderRequests(req, res);
  }
  return exports.getMyRequests(req, res);
};

// @desc    Update request status
// @route   PUT /api/requests/:id
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only lender or admin can update status
    if (request.lender.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    // If accepted, we might want to mark item as unavailable (optional logic)
    if (status === 'accepted') {
      // await Item.findByIdAndUpdate(request.item, { available: false });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
