const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'restaurant-pos';
    if (file.fieldname === 'menu') folderName = 'restaurant-pos/menu';
    else if (file.fieldname === 'avatar') folderName = 'restaurant-pos/profiles';
    else if (file.fieldname === 'qr') folderName = 'restaurant-pos/qr';
    
    return {
      folder: folderName,
      resource_type: 'auto', // Important for handling video/audio, not just images
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp3', 'mp4', 'webm'],
    };
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype.startsWith('audio/') || 
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images, audio, and video files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
