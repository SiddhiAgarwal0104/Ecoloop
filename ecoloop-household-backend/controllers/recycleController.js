// const Recycle = require('../models/Recycle');
// const AppError = require('../utils/appError');
// const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
// const { updateUserStats } = require('./rewardsController');

// // @desc    Create recycle request (with image upload)
// // @route   POST /api/recycle
// // @access  Private (Household only)
// exports.createRecycleRequest = async (req, res, next) => {
//   try {
//     console.log('📥 Request body:', req.body);
//     console.log('📸 Files received:', req.files?.length || 0);

//     const {
//       wasteCategory,
//       wasteType,
//       quantity,
//       unit,
//       description,
//       address,
//       latitude,
//       longitude
//     } = req.body;

//     // Validate required fields
//     if (!wasteCategory || !wasteType || !quantity || !address || !latitude || !longitude) {
//       return next(new AppError('Please provide all required fields', 400));
//     }

//     // Upload images to Cloudinary
//     let imageUrls = [];
//     if (req.files && req.files.length > 0) {
//       console.log('📤 Uploading images to Cloudinary...');
//       try {
//         imageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycle');
//         console.log('✅ Images uploaded successfully:', imageUrls);
//       } catch (uploadError) {
//         console.error('❌ Image upload failed:', uploadError);
//         return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
//       }
//     }

//     // Create recycle request
//     const recycleRequest = await Recycle.create({
//       userId: req.user.id,
//       wasteCategory: wasteCategory.toUpperCase(),
//       wasteType: wasteType.toUpperCase(),
//       quantity: parseFloat(quantity),
//       unit: unit || 'KG',
//       description: description || '',
//       images: imageUrls,
//       pickupLocation: {
//         address: address,
//         latitude: parseFloat(latitude),
//         longitude: parseFloat(longitude)
//       },
//       status: 'AVAILABLE',
//       assignedRecycler: null
//     });

//     // ✅ UPDATE USER STATS (AWARD POINTS FOR CREATING RECYCLE REQUEST)
//     await updateUserStats(req.user.id, 'RECYCLE_CREATED', {
//       quantity: recycleRequest.quantity,
//       wasteCategory: recycleRequest.wasteCategory
//     });

//     console.log('✅ Recycle request created:', recycleRequest._id);

//     res.status(201).json({
//       success: true,
//       message: 'Recycle request created successfully',
//       data: { recycleRequest }
//     });
//   } catch (error) {
//     console.error('❌ Error creating recycle request:', error);
//     next(error);
//   }
// };

// // @desc    Get all my recycle requests
// // @route   GET /api/recycle/my
// // @access  Private (Household only)
// exports.getMyRecycleRequests = async (req, res, next) => {
//   try {
//     const recycleRequests = await Recycle.find({ userId: req.user.id })
//       .populate('assignedRecycler', 'name email phone')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: recycleRequests.length,
//       data: { recycleRequests }
//     });
//   } catch (error) {
//     console.error('❌ Error fetching recycle requests:', error);
//     next(error);
//   }
// };

// // @desc    Get single recycle request by ID
// // @route   GET /api/recycle/:id
// // @access  Private (Household only)
// exports.getRecycleRequestById = async (req, res, next) => {
//   try {
//     const recycleRequest = await Recycle.findById(req.params.id)
//       .populate('assignedRecycler', 'name email phone');

//     if (!recycleRequest) {
//       return next(new AppError('Recycle request not found', 404));
//     }

//     // Check if user owns this request
//     if (recycleRequest.userId.toString() !== req.user.id) {
//       return next(new AppError('Not authorized to access this recycle request', 403));
//     }

//     res.status(200).json({
//       success: true,
//       data: { recycleRequest }
//     });
//   } catch (error) {
//     console.error('❌ Error fetching recycle request:', error);
//     next(error);
//   }
// };

// // @desc    Update recycle request (limited fields)
// // @route   PUT /api/recycle/:id
// // @access  Private (Household only)
// exports.updateRecycleRequest = async (req, res, next) => {
//   try {
//     let recycleRequest = await Recycle.findById(req.params.id);

//     if (!recycleRequest) {
//       return next(new AppError('Recycle request not found', 404));
//     }

//     // Check ownership
//     if (recycleRequest.userId.toString() !== req.user.id) {
//       return next(new AppError('Not authorized to update this recycle request', 403));
//     }

//     // Only allow update if status is AVAILABLE
//     if (recycleRequest.status !== 'AVAILABLE') {
//       return next(new AppError('Cannot update recycle request that has been accepted', 400));
//     }

//     // Allow updating specific fields only
//     const { wasteCategory, wasteType, quantity, unit, description } = req.body;

//     const updateData = {};
//     if (wasteCategory) updateData.wasteCategory = wasteCategory.toUpperCase();
//     if (wasteType) updateData.wasteType = wasteType.toUpperCase();
//     if (quantity) updateData.quantity = parseFloat(quantity);
//     if (unit) updateData.unit = unit;
//     if (description !== undefined) updateData.description = description;

//     // Handle new images if provided
//     if (req.files && req.files.length > 0) {
//       console.log('📤 Uploading additional images...');
//       try {
//         const newImageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycle');
//         updateData.images = [...recycleRequest.images, ...newImageUrls];
//         console.log('✅ New images added:', newImageUrls);
//       } catch (uploadError) {
//         console.error('❌ Image upload failed:', uploadError);
//         return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
//       }
//     }

//     recycleRequest = await Recycle.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Recycle request updated successfully',
//       data: { recycleRequest }
//     });
//   } catch (error) {
//     console.error('❌ Error updating recycle request:', error);
//     next(error);
//   }
// };

// // @desc    Delete recycle request
// // @route   DELETE /api/recycle/:id
// // @access  Private (Household only)
// exports.deleteRecycleRequest = async (req, res, next) => {
//   try {
//     const recycleRequest = await Recycle.findById(req.params.id);

//     if (!recycleRequest) {
//       return next(new AppError('Recycle request not found', 404));
//     }

//     // Check ownership
//     if (recycleRequest.userId.toString() !== req.user.id) {
//       return next(new AppError('Not authorized to delete this recycle request', 403));
//     }

//     // Only allow deletion if status is AVAILABLE
//     if (recycleRequest.status !== 'AVAILABLE') {
//       return next(new AppError('Cannot delete recycle request that has been accepted', 400));
//     }

//     // ✅ REVERSE USER STATS BEFORE DELETION (DEDUCT POINTS)
//     await updateUserStats(req.user.id, 'RECYCLE_DELETED', {
//       quantity: recycleRequest.quantity,
//       wasteCategory: recycleRequest.wasteCategory
//     });

//     await recycleRequest.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: 'Recycle request deleted successfully',
//       data: {}
//     });
//   } catch (error) {
//     console.error('❌ Error deleting recycle request:', error);
//     next(error);
//   }
// };

const Recycle = require('../models/Recycle');
const Notification = require('../models/HouseholdNotification');
const AppError = require('../utils/appError');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
const { updateUserStats } = require('./rewardsController');

// ================= HELPER: CALCULATE DISTANCE =================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ================= HOUSEHOLD: CREATE RECYCLE REQUEST =================
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

    // Update user stats
    await updateUserStats(req.user.id, 'RECYCLE_CREATED', {
      quantity: recycleRequest.quantity,
      wasteCategory: recycleRequest.wasteCategory
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

// ================= HOUSEHOLD: GET MY RECYCLE REQUESTS =================
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

// ================= HOUSEHOLD: GET SINGLE RECYCLE REQUEST =================
// @route   GET /api/recycle/:id
// @access  Private (Household or Recycler)
exports.getRecycleRequestById = async (req, res, next) => {
  try {
    const recycleRequest = await Recycle.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedRecycler', 'name email phone');

    if (!recycleRequest) {
      return next(new AppError('Recycle request not found', 404));
    }

    // Check authorization
    const isOwner = recycleRequest.userId._id.toString() === req.user.id;
    const isAssignedRecycler = recycleRequest.assignedRecycler && 
      recycleRequest.assignedRecycler._id.toString() === req.user.id;

    if (!isOwner && !isAssignedRecycler) {
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

// ================= HOUSEHOLD: UPDATE RECYCLE REQUEST =================
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

// ================= HOUSEHOLD: DELETE RECYCLE REQUEST =================
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

    // Reverse user stats before deletion
    await updateUserStats(req.user.id, 'RECYCLE_DELETED', {
      quantity: recycleRequest.quantity,
      wasteCategory: recycleRequest.wasteCategory
    });

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

// ================= RECYCLER: GET AVAILABLE REQUESTS =================
// @route   GET /api/recycle/available
// @access  Private (Recycler only)
exports.getAvailableRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, radius = 10, city } = req.query;
    const recyclerId = req.user.id;
    
    console.log(`📥 Getting available recycles for recycler: ${recyclerId}`);
    
    // Get recycler's location
    let recyclerLat = req.user.latitude;
    let recyclerLng = req.user.longitude;
    
    console.log(`📍 Recycler location: (${recyclerLat}, ${recyclerLng})`);

    // Fetch available requests
    const allRecycles = await Recycle.find({
      status: 'AVAILABLE',
      assignedRecycler: null
    })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    let recycles = allRecycles;
    console.log(`✅ Fetched ${recycles.length} total available requests`);
    
    // Filter by city name if provided
    if (city && city.trim()) {
      const cityFilter = city.trim().toLowerCase();
      console.log(`🏙️ Filtering by city: ${city}`);
      recycles = allRecycles.filter(req => {
        const address = req.pickupLocation?.address || '';
        return address.toLowerCase().includes(cityFilter);
      });
      console.log(`✅ Filtered to ${recycles.length} requests from city: ${city}`);
    }
    // Filter by recycler location (distance) if no city filter and recycler has location
    else if (recyclerLat && recyclerLng) {
      const searchRadius = parseFloat(radius);
      console.log(`📍 Filtering by distance. Radius: ${searchRadius}km`);
      
      recycles = allRecycles.map(req => {
        const pickupLat = req.pickupLocation?.latitude || 0;
        const pickupLng = req.pickupLocation?.longitude || 0;
        
        const distance = calculateDistance(recyclerLat, recyclerLng, pickupLat, pickupLng);
        
        return { ...req, distance: Math.round(distance * 10) / 10 };
      }).filter(req => req.distance <= searchRadius);
      
      console.log(`✅ Filtered to ${recycles.length} requests within ${searchRadius}km`);
    }

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const paginatedRecycles = recycles.slice(start, start + limitNum);

    res.status(200).json({
      success: true,
      data: paginatedRecycles,
      pagination: {
        total: recycles.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(recycles.length / limitNum)
      },
      message: `${paginatedRecycles.length} waste requests available`
    });
  } catch (error) {
    console.error('❌ Error fetching available requests:', error);
    next(error);
  }
};

// ================= RECYCLER: ACCEPT REQUEST =================
// @route   POST /api/recycle/:id/accept
// @access  Private (Recycler only)
exports.acceptRecycleRequest = async (req, res, next) => {
  try {
    const recycleId = req.params.id;
    const recyclerId = req.user.id;

    console.log(`📥 Accept request - Recycle ID: ${recycleId}, Recycler ID: ${recyclerId}`);

    const recycle = await Recycle.findById(recycleId);
    
    if (!recycle) {
      return next(new AppError('Recycle request not found', 404));
    }

    if (recycle.status !== 'AVAILABLE') {
      return next(new AppError(`This request has already been accepted (status: ${recycle.status})`, 400));
    }

    // Update recycle status
    recycle.status = 'ACCEPTED';
    recycle.assignedRecycler = recyclerId;
    recycle.acceptedAt = new Date();
    
    await recycle.save();

    // Create notification for household
    await Notification.create({
      userId: recycle.userId,
      type: 'RECYCLE_ACCEPTED',
      title: 'Recycle Request Accepted',
      message: `Your ${recycle.wasteCategory.toLowerCase()} recycle request has been accepted by a recycler.`,
      relatedId: recycle._id
    });

    // Create notification for recycler
    await Notification.create({
      userId: recyclerId,
      type: 'REQUEST_ACCEPTED',
      title: '✅ New Pickup Accepted',
      message: `You accepted a waste request for ${recycle.wasteCategory} (${recycle.quantity} ${recycle.unit})`,
      data: {
        recycleId: recycle._id,
        category: recycle.wasteCategory,
        quantity: recycle.quantity,
        unit: recycle.unit,
        location: recycle.pickupLocation?.address
      }
    });

    console.log(`✅ Recycle ${recycleId} accepted by recycler ${recyclerId}`);

    res.status(200).json({
      success: true,
      message: 'Recycle request accepted successfully',
      data: recycle
    });
  } catch (error) {
    console.error('❌ Error accepting recycle request:', error);
    next(error);
  }
};

// ================= RECYCLER: GET MY ACCEPTED REQUESTS =================
// @route   GET /api/recycle/my-accepted
// @access  Private (Recycler only)
exports.getMyAcceptedRequests = async (req, res, next) => {
  try {
    const recyclerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { assignedRecycler: recyclerId };
    
    if (status) {
      query.status = status.toUpperCase();
    }

    const skip = (page - 1) * limit;
    const requests = await Recycle.find(query)
      .populate('userId', 'name phone address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recycle.countDocuments(query);

    console.log(`✅ Found ${requests.length} accepted recycles for recycler ${recyclerId}`);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      message: `${requests.length} accepted requests found`
    });
  } catch (error) {
    console.error('❌ Error fetching recycler requests:', error);
    next(error);
  }
};

// ================= RECYCLER: UPDATE REQUEST STATUS =================
// @route   PUT /api/recycle/:id/status
// @access  Private (Recycler only)
exports.updateRecycleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const recyclerId = req.user.id;

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const validStatuses = ['PICKED_UP', 'RECYCLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const recycle = await Recycle.findOne({
      _id: id,
      assignedRecycler: recyclerId
    });

    if (!recycle) {
      return next(new AppError('Recycle request not found or unauthorized', 404));
    }

    recycle.status = status.toUpperCase();

    if (status === 'RECYCLED') {
      recycle.recycledAt = new Date();
      
      // Award points for completion
      await updateUserStats(recycle.userId, 'RECYCLE_COMPLETED', {
        quantity: recycle.quantity,
        wasteCategory: recycle.wasteCategory
      });
    }

    await recycle.save();

    // Create notification
    let notificationMessage = '';
    if (status === 'PICKED_UP') {
      notificationMessage = `Your ${recycle.wasteCategory.toLowerCase()} has been picked up by the recycler.`;
    } else if (status === 'RECYCLED') {
      notificationMessage = `Your ${recycle.wasteCategory.toLowerCase()} has been successfully recycled. Thank you for contributing!`;
    }

    if (notificationMessage) {
      await Notification.create({
        userId: recycle.userId,
        type: `RECYCLE_${status}`,
        title: 'Status Update',
        message: notificationMessage,
        relatedId: recycle._id
      });
    }

    console.log(`✅ Recycle request ${id} status updated to ${status}`);

    res.status(200).json({
      success: true,
      message: `Recycle request status updated to ${status}`,
      data: recycle
    });
  } catch (error) {
    console.error('❌ Error updating recycle status:', error);
    next(error);
  }
};

module.exports = exports;