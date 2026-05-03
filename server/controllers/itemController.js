const Item = require('../models/Item');
const { formatItemImages } = require('../utils/urlFormatter');

// @desc    Get all items (with filters)
// @route   GET /api/items
exports.getItems = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, lat, lng, radius, city } = req.query;
    let query = { available: true };

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Same-city filter: match city name anywhere in the address field
    if (city && !lat) {
      query.address = { $regex: city.trim(), $options: 'i' };
    }

    // Nearby filter: geo-spatial query (overrides city filter if both lat+lng are present)
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: (parseFloat(radius) || 5) * 1000 // radius in km, default 5 km
        }
      };
    }

    const items = await Item.find(query).populate('owner', 'name avatar rating');
    
    // Format image URLs for each item
    const formattedItems = items.map(item => formatItemImages(item, req));
    
    res.json(formattedItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new item
// @route   POST /api/items
exports.createItem = async (req, res) => {
  try {
    console.log('Create Item request body:', req.body);
    const payload = { ...req.body };

    // Mobile client sends "location" as plain text; backend schema expects "address".
    if (!payload.address && payload.location && typeof payload.location === 'string') {
      payload.address = payload.location;
    }

    // If coords are not provided by client, keep valid default Point coords.
    if (!payload.location || typeof payload.location === 'string') {
      payload.location = {
        type: 'Point',
        coordinates: [0, 0],
      };
    }

    // Strip base URL from image paths before saving to DB to keep it host-agnostic
    if (payload.images && Array.isArray(payload.images)) {
      const host = req.get('host');
      payload.images = payload.images.map(img => {
        if (typeof img === 'string' && img.includes(host)) {
          // Extract the path after the host
          const parts = img.split(host);
          return parts[parts.length - 1];
        }
        return img;
      });
    }

    const item = await Item.create({
      ...payload,
      owner: req.user.id,
    });
    console.log(`✅ Item created successfully: ${item.title}`);
    
    // Populate owner to format response correctly
    const populatedItem = await Item.findById(item._id).populate('owner', 'name avatar rating');
    res.status(201).json(formatItemImages(populatedItem, req));
  } catch (error) {
    console.error('Create Item error:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name avatar rating reviews location');
    if (item) {
      res.json(formatItemImages(item, req));
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (!updates.address && updates.location && typeof updates.location === 'string') {
      updates.address = updates.location;
    }
    
    // Strip base URL from images if present
    if (updates.images && Array.isArray(updates.images)) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updates.images = updates.images.map(img => img.replace(baseUrl, ''));
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('owner', 'name avatar rating');
    res.json(formatItemImages(updatedItem, req));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

