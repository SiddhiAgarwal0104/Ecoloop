const { cloudinary } = require('../config/cloudinary');

/**
 * Cloudinary Image Upload Module
 * Handles image uploads to Cloudinary cloud storage
 * Supports single and multiple file uploads
 */

/**
 * Upload single image to Cloudinary
 * @async
 * @param {object} file - Multer file object with buffer
 * @param {string} folder - Cloudinary folder path (default: 'ecoloop/recycler')
 * @returns {Promise<string>} Secure URL of uploaded image
 * @throws {Error} If upload fails
 * @example
 * const url = await uploadToCloudinary(req.file, 'ecoloop/recycler/profiles');
 */
const uploadToCloudinary = async (file, folder = 'ecoloop/recycler') => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Check if cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.error('❌ Cloudinary not configured. Missing environment variables:', {
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY
      });
      reject(new Error('Cloudinary is not properly configured. Please check CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY'));
      return;
    }

    try {
      console.log(`📤 Starting upload: ${file.originalname} to folder: ${folder}`);
      
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', {
              message: error.message,
              status: error.http_code,
              errorCode: error.error?.error_code
            });
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            console.log(`✅ Image uploaded successfully:`, {
              filename: file.originalname,
              publicId: result.public_id,
              size: result.bytes,
              url: result.secure_url
            });
            resolve(result.secure_url);
          }
        }
      );

      stream.on('error', (error) => {
        console.error('❌ Stream error:', error.message);
        reject(new Error(`Stream error during upload: ${error.message}`));
      });

      // Set timeout for upload
      setTimeout(() => {
        if (!stream.writableEnded && !stream.destroyed) {
          stream.destroy();
          reject(new Error('Upload timeout - request took too long'));
        }
      }, 30000); // 30 second timeout

      stream.end(file.buffer);
    } catch (error) {
      console.error('❌ Upload error:', error);
      reject(new Error(`Upload failed: ${error.message}`));
    }
  });
};

/**
 * Upload multiple images to Cloudinary
 * @async
 * @param {array} files - Array of multer file objects
 * @param {string} folder - Cloudinary folder path (default: 'ecoloop/recycler')
 * @returns {Promise<array>} Array of secure URLs
 * @throws {Error} If any upload fails
 * @example
 * const urls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycler');
 */
const uploadMultipleToCloudinary = async (files, folder = 'ecoloop/recycler') => {
  try {
    if (!files || files.length === 0) {
      console.log('ℹ️ No files provided - skipping image upload');
      return [];
    }

    console.log(`📤 Uploading ${files.length} images to Cloudinary folder: ${folder}`);

    const uploadPromises = files.map((file, index) => {
      console.log(`  [${index + 1}/${files.length}] Processing: ${file.originalname}`);
      return uploadToCloudinary(file, folder);
    });

    const urls = await Promise.all(uploadPromises);

    console.log(`✅ Successfully uploaded ${urls.length} images`);
    return urls;
  } catch (error) {
    console.error('❌ Multiple upload failed:', {
      message: error.message,
      filesCount: files?.length || 0
    });
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @async
 * @param {string} publicId - Public ID of the image in Cloudinary
 * @returns {Promise<object>} Deletion result
 * @throws {Error} If deletion fails
 * @example
 * await deleteFromCloudinary('ecoloop/recycler/image123');
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Get image URL from public ID
 * @param {string} publicId - Public ID in Cloudinary
 * @param {object} options - URL generation options
 * @returns {string} Cloudinary URL
 * @example
 * const url = getImageUrl('ecoloop/recycler/image123', { width: 300 });
 */
const getImageUrl = (publicId, options = {}) => {
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      ...options
    });
    return url;
  } catch (error) {
    console.error('❌ URL generation error:', error);
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  getImageUrl
};
