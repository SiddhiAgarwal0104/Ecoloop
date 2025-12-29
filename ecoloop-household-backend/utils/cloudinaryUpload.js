const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const uploadToCloudinary = (fileBuffer, folder = 'ecoloop') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const readableStream = Readable.from(fileBuffer);
    readableStream.pipe(uploadStream);
  });
};

const uploadMultipleToCloudinary = async (files, folder = 'ecoloop') => {
  const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, folder));
  return await Promise.all(uploadPromises);
};

module.exports = { uploadToCloudinary, uploadMultipleToCloudinary };
