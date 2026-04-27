const express = require('express');
const router = express.Router();
const { getItems, createItem, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getItems)
  .post(protect, authorize('renter', 'lender', 'admin'), createItem);

router.post('/upload', protect, upload.array('images', 5), (req, res) => {
  const urls = req.files.map(file => {
    // If it's a local file, it will have a filename property
    if (file.filename && !file.path.startsWith('http')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      return `${baseUrl}/uploads/${file.filename}`;
    }
    // Cloudinary returns the URL in path or secure_url
    return file.path;
  });
  res.json({ urls });
});

router.route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;
