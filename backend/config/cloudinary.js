const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string|Buffer} fileData - File path, URL, or buffer data
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Upload result with URL
 */
const uploadImage = async (fileData, folder = 'community-sharing') => {
  try {
    // Handle buffer uploads
    if (Buffer.isBuffer(fileData)) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(new Error(`Image upload failed: ${error.message}`));
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        );
        stream.end(fileData);
      });
    } else {
      // Handle file path or URL uploads
      const result = await cloudinary.uploader.upload(fileData, {
        folder: folder,
        resource_type: 'auto',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Image deletion failed: ${error.message}`);
  }
};

module.exports = { uploadImage, deleteImage };