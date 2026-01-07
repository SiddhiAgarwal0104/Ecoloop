const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary Configuration Module
 * Initializes Cloudinary for image/video storage and management
 * Handles cloud-based media hosting
 */

// Validate environment variables
if (!process.env.CLOUDINARY_NAME) {
  console.warn('⚠️ CLOUDINARY_NAME not configured');
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
  cloud_name: process.env.CLOUDINARY_NAME,
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

module.exports = { cloudinary, verifyCloudinaryConfig };
