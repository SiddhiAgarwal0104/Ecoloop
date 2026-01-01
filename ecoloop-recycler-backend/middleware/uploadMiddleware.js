const multer = require('multer');
const path = require('path');

/**
 * File Upload Middleware
 * Handles file uploads using multer with memory storage
 * Images are processed and uploaded to Cloudinary
 */

// Use memory storage (files are stored in memory, not disk)
// This is ideal for serverless environments and cloud deployments
const storage = multer.memoryStorage();

/**
 * File filter for validating uploaded files
 * @param {object} req - Express request object
 * @param {object} file - Multer file object
 * @param {function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ];

  // Check file MIME type
  if (allowedMimes.includes(file.mimetype)) {
    console.log(`✅ File accepted: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  } else {
    console.warn(`⚠️ File rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

/**
 * Create multer upload instance
 * Configured for image uploads with size and type validation
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
