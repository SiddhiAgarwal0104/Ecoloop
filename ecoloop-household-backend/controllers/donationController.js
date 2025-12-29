const Donation = require('../models/Donation');
const AppError = require('../utils/appError');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Create donation (with image upload)
// @route   POST /api/donations
// @access  Private (Household only)
exports.createDonation = async (req, res, next) => {
  try {
    console.log('📥 Request body:', req.body);
    console.log('📸 Files received:', req.files?.length || 0);
    
    const { category, condition, quantity, description } = req.body;

    // Parse location
    const location =
      typeof req.body.location === 'string'
        ? JSON.parse(req.body.location)
        : req.body.location;

    if (
      !category ||
      !condition ||
      !quantity ||
      !location?.latitude ||
      !location?.longitude ||
      !location?.address
    ) {
      return next(new AppError('Missing required fields', 400));
    }

    // UPLOAD IMAGES TO CLOUDINARY
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log('🔄 Starting image upload...');
      console.log('Files to upload:', req.files.map(f => ({
        name: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
        hasBuffer: !!f.buffer
      })));
      
      try {
        imageUrls = await uploadMultipleToCloudinary(
          req.files,
          'ecoloop/donations'
        );
        console.log('✅ Images uploaded successfully:', imageUrls);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
      }
    } else {
      console.log('⚠️ No files in request');
    }

    // CREATE DONATION
    const donation = await Donation.create({
      userId: req.user.id,
      itemCategory: category.toUpperCase(),
      condition: condition.toUpperCase(),
      quantity: Number(quantity),
      description: description || '',
      images: imageUrls,
      pickupLocation: {
        address: location.address,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },
    });

    console.log('✅ Donation created:', donation._id);

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: donation,
    });
  } catch (err) {
    console.error('❌ Error in createDonation:', err);
    next(err);
  }
};

// @desc    Get all my donations
// @route   GET /api/donations/my
// @access  Private (Household only)
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    next(error);
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private
exports.getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('❌ Error fetching donation:', error);
    next(error);
  }
};

// @desc    Update donation (limited fields)
// @route   PUT /api/donations/:id
// @access  Private (Household only)
exports.updateDonation = async (req, res, next) => {
  try {
    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    // Check ownership
    if (donation.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to update this donation', 403));
    }

    // Only allow update if status is AVAILABLE
    if (donation.status !== 'AVAILABLE') {
      return next(new AppError('Cannot update donation that has been accepted', 400));
    }

    // Allow updating specific fields only
    const { itemCategory, condition, quantity, description } = req.body;

    const updateData = {};
    if (itemCategory) updateData.itemCategory = itemCategory.toUpperCase();
    if (condition) updateData.condition = condition.toUpperCase();
    if (quantity) updateData.quantity = Number(quantity);
    if (description !== undefined) updateData.description = description;

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      console.log('🔄 Uploading additional images...');
      try {
        const newImageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/donations');
        updateData.images = [...donation.images, ...newImageUrls];
        console.log('✅ New images added:', newImageUrls);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
      }
    }

    donation = await Donation.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('❌ Error updating donation:', error);
    next(error);
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private (Household only)
exports.deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    // Check ownership
    if (donation.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to delete this donation', 403));
    }

    // Only allow deletion if status is AVAILABLE
    if (donation.status !== 'AVAILABLE') {
      return next(new AppError('Cannot delete donation that has been accepted', 400));
    }

    await donation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('❌ Error deleting donation:', error);
    next(error);
  }
};