const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

let storage;

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
const forceCloudinary = process.env.FORCE_CLOUDINARY === 'true';
const isDevelopment = process.env.NODE_ENV !== 'production';

// In local development, prefer local disk uploads unless explicitly forced.
// This avoids runtime 500s from partial/invalid Cloudinary env values.
const hasValidCloudinaryConfig =
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== 'Untitled' &&
  !cloudName.startsWith('cloudinary_');

const useCloudinary = hasValidCloudinaryConfig && (forceCloudinary || !isDevelopment);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'rentals',
      allowed_formats: ['jpg', 'png', 'jpeg'],
    },
  });
} else {
  // Fallback to local storage if Cloudinary is not configured
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
}

const upload = multer({ storage: storage });

module.exports = upload;
