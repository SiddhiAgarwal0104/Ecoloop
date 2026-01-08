const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary Configuration Module
 * Initializes Cloudinary for image/video storage and management
 * Handles cloud-based media hosting
 */

// Validate environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️ CLOUDINARY_CLOUD_NAME not configured');
}

if (!process.env.CLOUDINARY_API_KEY) {
  console.warn('⚠️ CLOUDINARY_API_KEY not configured');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️ CLOUDINARY_API_SECRET not configured');
}

/**
 * Configure Cloudinary with API credentials
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Verify Cloudinary configuration
 * @async
 * @returns {Promise<object>} Cloudinary account info
 */
const verifyCloudinaryConfig = async () => {
  try {
    const auth = await cloudinary.api.resources_by_tag('verify', {
      max_results: 1
    });
    console.log('✅ Cloudinary Connection Verified');
    return auth;
  } catch (error) {
    console.warn('⚠️ Cloudinary Verification Failed:', error.message);
  }
};

/**
 * Upload image to Cloudinary
 * @async
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Upload result with URL
 */
const uploadImage = async (fileBuffer, folder = 'ecoloop') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary Upload Error:', error);
          reject(error);
        } else {
          console.log('✅ Image uploaded to Cloudinary:', result.public_id);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = { cloudinary, verifyCloudinaryConfig, uploadImage };
