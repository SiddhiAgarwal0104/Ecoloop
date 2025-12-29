const Recycle = require('../models/Recycle');
const AppError = require('../utils/appError');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Create recycle request (with image upload)
// @route   POST /api/recycle
// @access  Private (Household only)
exports.createRecycleRequest = async (req, res, next) => {
  try {
    console.log('📥 Request body:', req.body);
    console.log('📸 Files received:', req.files?.length || 0);

    const {
      wasteCategory,
      wasteType,
      quantity,
      unit,
      description,
      address,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!wasteCategory || !wasteType || !quantity || !address || !latitude || !longitude) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log('📤 Uploading images to Cloudinary...');
      try {
        imageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycle');
        console.log('✅ Images uploaded successfully:', imageUrls);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
      }
    }

    // Create recycle request
    const recycleRequest = await Recycle.create({
      userId: req.user.id,
      wasteCategory: wasteCategory.toUpperCase(),
      wasteType: wasteType.toUpperCase(),
      quantity: parseFloat(quantity),
      unit: unit || 'KG',
      description: description || '',
      images: imageUrls,
      pickupLocation: {
        address: address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      status: 'AVAILABLE',
      assignedRecycler: null
    });

    console.log('✅ Recycle request created:', recycleRequest._id);

    res.status(201).json({
      success: true,
      message: 'Recycle request created successfully',
      data: { recycleRequest }
    });
  } catch (error) {
    console.error('❌ Error creating recycle request:', error);
    next(error);
  }
};

// @desc    Get all my recycle requests
// @route   GET /api/recycle/my
// @access  Private (Household only)
exports.getMyRecycleRequests = async (req, res, next) => {
  try {
    const recycleRequests = await Recycle.find({ userId: req.user.id })
      .populate('assignedRecycler', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recycleRequests.length,
      data: { recycleRequests }
    });
  } catch (error) {
    console.error('❌ Error fetching recycle requests:', error);
    next(error);
  }
};

// @desc    Get single recycle request by ID
// @route   GET /api/recycle/:id
// @access  Private (Household only)
exports.getRecycleRequestById = async (req, res, next) => {
  try {
    const recycleRequest = await Recycle.findById(req.params.id)
      .populate('assignedRecycler', 'name email phone');

    if (!recycleRequest) {
      return next(new AppError('Recycle request not found', 404));
    }

    // Check if user owns this request
    if (recycleRequest.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to access this recycle request', 403));
    }

    res.status(200).json({
      success: true,
      data: { recycleRequest }
    });
  } catch (error) {
    console.error('❌ Error fetching recycle request:', error);
    next(error);
  }
};

// @desc    Update recycle request (limited fields)
// @route   PUT /api/recycle/:id
// @access  Private (Household only)
exports.updateRecycleRequest = async (req, res, next) => {
  try {
    let recycleRequest = await Recycle.findById(req.params.id);

    if (!recycleRequest) {
      return next(new AppError('Recycle request not found', 404));
    }

    // Check ownership
    if (recycleRequest.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to update this recycle request', 403));
    }

    // Only allow update if status is AVAILABLE
    if (recycleRequest.status !== 'AVAILABLE') {
      return next(new AppError('Cannot update recycle request that has been accepted', 400));
    }

    // Allow updating specific fields only
    const { wasteCategory, wasteType, quantity, unit, description } = req.body;

    const updateData = {};
    if (wasteCategory) updateData.wasteCategory = wasteCategory.toUpperCase();
    if (wasteType) updateData.wasteType = wasteType.toUpperCase();
    if (quantity) updateData.quantity = parseFloat(quantity);
    if (unit) updateData.unit = unit;
    if (description !== undefined) updateData.description = description;

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      console.log('📤 Uploading additional images...');
      try {
        const newImageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycle');
        updateData.images = [...recycleRequest.images, ...newImageUrls];
        console.log('✅ New images added:', newImageUrls);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
      }
    }

    recycleRequest = await Recycle.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Recycle request updated successfully',
      data: { recycleRequest }
    });
  } catch (error) {
    console.error('❌ Error updating recycle request:', error);
    next(error);
  }
};

// @desc    Delete recycle request
// @route   DELETE /api/recycle/:id
// @access  Private (Household only)
exports.deleteRecycleRequest = async (req, res, next) => {
  try {
    const recycleRequest = await Recycle.findById(req.params.id);

    if (!recycleRequest) {
      return next(new AppError('Recycle request not found', 404));
    }

    // Check ownership
    if (recycleRequest.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to delete this recycle request', 403));
    }

    // Only allow deletion if status is AVAILABLE
    if (recycleRequest.status !== 'AVAILABLE') {
      return next(new AppError('Cannot delete recycle request that has been accepted', 400));
    }

    await recycleRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Recycle request deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('❌ Error deleting recycle request:', error);
    next(error);
  }
};