const Donation = require('../models/Donation');
const AppError = require('../utils/appError');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
const { updateUserStats } = require('./rewardsController');

// @desc    Create donation (with image upload)
// @route   POST /api/donations
// @access  Private (Household only)
exports.createDonation = async (req, res, next) => {
  try {
    console.log('📥 Request body:', req.body);
    console.log('📸 Files received:', req.files?.length || 0);
    
    const { category, condition, quantity, description } = req.body;

    // Parse location (handle both string and object)
    let location;
    if (typeof req.body.location === 'string') {
      try {
        location = JSON.parse(req.body.location);
      } catch (parseError) {
        console.error('❌ Failed to parse location:', parseError);
        return next(new AppError('Invalid location format', 400));
      }
    } else {
      location = req.body.location;
    }

    // STRICT VALIDATION
    if (!category || !condition || !quantity) {
      return next(new AppError('Category, condition, and quantity are required', 400));
    }

    if (!location || !location.address) {
      return next(new AppError('Location address is required', 400));
    }

    // Parse and validate coordinates
    const latitude = parseFloat(location.latitude);
    const longitude = parseFloat(location.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return next(new AppError('Valid latitude and longitude coordinates are required', 400));
    }

    if (latitude < -90 || latitude > 90) {
      return next(new AppError('Latitude must be between -90 and 90', 400));
    }

    if (longitude < -180 || longitude > 180) {
      return next(new AppError('Longitude must be between -180 and 180', 400));
    }

    console.log('✅ Location validated:', {
      address: location.address,
      latitude,
      longitude
    });

    // UPLOAD IMAGES
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log('📤 Starting image upload...');
      console.log('Files:', req.files.map(f => ({
        name: f.originalname,
        size: f.size,
        mimetype: f.mimetype
      })));
      
      try {
        imageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/donations');
        console.log('✅ Images uploaded:', imageUrls);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
      }
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
        address: location.address.trim(),
        latitude: latitude,
        longitude: longitude,
      },
    });

    // ✅ UPDATE USER STATS (AWARD POINTS FOR CREATING DONATION)
    await updateUserStats(req.user.id, 'DONATION_CREATED', {
      quantity: donation.quantity
    });

    console.log('✅ Donation created:', {
      id: donation._id,
      category: donation.itemCategory,
      location: donation.pickupLocation
    });

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
    const donations = await Donation.find({ userId: req.user.id })
      .populate('assignedNGO', 'name email phone')
      .sort({ createdAt: -1 });

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
    const donation = await Donation.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedNGO', 'name email phone');

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    // Check if user is authorized to view
    if (donation.userId._id.toString() !== req.user.id && 
        (!donation.assignedNGO || donation.assignedNGO._id.toString() !== req.user.id)) {
      return next(new AppError('Not authorized to view this donation', 403));
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

// @desc    Update donation
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

    // Only allow update if AVAILABLE
    if (donation.status !== 'AVAILABLE') {
      return next(new AppError('Cannot update donation that has been accepted', 400));
    }

    const { itemCategory, condition, quantity, description } = req.body;

    const updateData = {};
    if (itemCategory) updateData.itemCategory = itemCategory.toUpperCase();
    if (condition) updateData.condition = condition.toUpperCase();
    if (quantity) updateData.quantity = Number(quantity);
    if (description !== undefined) updateData.description = description;

    // Handle new images
    if (req.files && req.files.length > 0) {
      console.log('📤 Uploading additional images...');
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
      data: donation
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

    if (donation.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to delete this donation', 403));
    }

    if (donation.status !== 'AVAILABLE') {
      return next(new AppError('Cannot delete donation that has been accepted', 400));
    }

    // ✅ REVERSE USER STATS BEFORE DELETION (DEDUCT POINTS)
    await updateUserStats(req.user.id, 'DONATION_DELETED', {
      quantity: donation.quantity
    });

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