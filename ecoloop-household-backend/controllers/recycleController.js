// const Recycle = require('../models/Recycle');
// const AppError = require('../utils/appError');
// const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
// const { updateUserStats } = require('./rewardsController');
// const { detectWasteType } = require('../services/visionApiService');

// // @desc    Create recycle request (with image upload)
// // @route   POST /api/recycle
// // @access  Private (Household only)
// exports.createRecycleRequest = async (req, res, next) => {
//   try {
//     console.log('📥 Create recycle request:', {
//       userId: req.user?.id,
//       userRole: req.user?.role,
//       body: req.body,
//       filesCount: req.files?.length || 0
//     });

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
//       console.error('❌ Missing required fields:', { wasteCategory, wasteType, quantity, address, latitude, longitude });
//       return next(new AppError('Please provide all required fields', 400));
//     }

//     // Upload images to Cloudinary
//     let imageUrls = [];
//     let aiDetectedWasteType = null;
//     let aiDetectionResult = null;

//     if (req.files && req.files.length > 0) {
//       console.log('📤 Uploading images to Cloudinary...');
//       try {
//         imageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycle');
//         console.log('✅ Images uploaded successfully:', imageUrls.length);

//         // 🤖 AI WASTE DETECTION - Analyze first image using Google Vision API
//         if (imageUrls.length > 0 && process.env.GOOGLE_VISION_ENABLED === 'true') {
//           console.log('🤖 Running AI waste detection on first image...');
//           console.log('📸 Image URL:', imageUrls[0]);
//           console.log('🔍 GOOGLE_VISION_ENABLED:', process.env.GOOGLE_VISION_ENABLED);
//           try {
//             aiDetectionResult = await detectWasteType(imageUrls[0], 'url');
            
//             console.log('📊 AI Detection result:', {
//               success: aiDetectionResult.success,
//               error: aiDetectionResult.error,
//               classification: aiDetectionResult.classification ? 'Present' : 'Null'
//             });

//             if (aiDetectionResult.success && aiDetectionResult.classification) {
//               aiDetectedWasteType = aiDetectionResult.classification.wasteType;
//               console.log('✅ AI Detection completed:', {
//                 detectedType: aiDetectedWasteType,
//                 confidence: aiDetectionResult.classification.confidence,
//                 recyclable: aiDetectionResult.classification.recyclable
//               });
//             } else {
//               console.warn('⚠️ AI Detection failed:', aiDetectionResult.error);
//             }
//           } catch (detectionError) {
//             console.error('⚠️ Vision API Error:', {
//               message: detectionError.message,
//               stack: detectionError.stack
//             });
//             // Don't fail the request if AI detection fails
//           }
//         } else {
//           console.log('⏭️ AI Detection skipped - Condition check:');
//           console.log('   - Images available:', imageUrls.length > 0);
//           console.log('   - GOOGLE_VISION_ENABLED:', process.env.GOOGLE_VISION_ENABLED);
//         }
//       } catch (uploadError) {
//         console.error('❌ Image upload failed:', uploadError.message);
//         return next(new AppError(`Image upload failed: ${uploadError.message}`, 500));
//       }
//     }

//     // Create recycle request
//     console.log('💾 Creating Recycle document...');
//     const recycleRequest = await Recycle.create({
//       userId: req.user.id,
//       wasteCategory: wasteCategory.toUpperCase(),
//       wasteType: wasteType.toUpperCase(),
//       quantity: parseFloat(quantity),
//       unit: unit || 'KG',
//       description: description || '',
//       images: imageUrls,
//       aiDetectedWasteType: aiDetectedWasteType,
//       aiDetectionResult: aiDetectionResult ? {
//         confidence: aiDetectionResult.classification?.confidence || 0,
//         recyclable: aiDetectionResult.classification?.recyclable || false,
//         detectedItems: aiDetectionResult.classification?.detectedItems || [],
//         tips: aiDetectionResult.classification?.tips || []
//       } : null,
//       pickupLocation: {
//         address: address,
//         latitude: parseFloat(latitude),
//         longitude: parseFloat(longitude)
//       },
//       status: 'AVAILABLE',
//       assignedRecycler: null
//     });

//     console.log('✅ Recycle document created:', recycleRequest._id);

//     // ✅ UPDATE USER STATS (AWARD POINTS FOR CREATING RECYCLE REQUEST)
//     console.log('📊 Updating user stats...');
//     try {
//       await updateUserStats(req.user.id, 'RECYCLE_CREATED', {
//         quantity: recycleRequest.quantity,
//         wasteCategory: recycleRequest.wasteCategory
//       });
//       console.log('✅ User stats updated');
//     } catch (statsError) {
//       console.error('⚠️ Failed to update user stats:', statsError.message);
//       // Don't fail the request if stats update fails
//     }

//     console.log('✅ Recycle request created successfully:', recycleRequest._id);

//     // Prepare AI detection response
//     const aiDetectionResponse = aiDetectionResult && aiDetectionResult.success && aiDetectionResult.classification ? {
//       detected: true,
//       wasteType: aiDetectionResult.classification.wasteType,
//       confidence: aiDetectionResult.classification.confidence,
//       recyclable: aiDetectionResult.classification.recyclable,
//       tips: aiDetectionResult.classification.tips || [],
//       description: aiDetectionResult.classification.description || '',
//       detectedItems: aiDetectionResult.classification.detectedItems || [],
//       categoryScores: aiDetectionResult.classification.categoryScores || {}
//     } : {
//       detected: false,
//       message: 'AI detection not available'
//     };

//     res.status(201).json({
//       success: true,
//       message: 'Recycle request created successfully',
//       data: { 
//         recycleRequest,
//         aiDetection: aiDetectionResponse
//       }
//     });
//   } catch (error) {
//     console.error('❌ Error creating recycle request:', {
//       message: error.message,
//       stack: error.stack,
//       name: error.name
//     });
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
const AppError = require('../utils/appError');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');
const { updateUserStats } = require('./rewardsController');
const axios = require('axios');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

// CNN Model API URL (your FastAPI predict_api.py)
const CNN_API_URL = process.env.CNN_API_URL || 'http://localhost:8000';

/**
 * Map CNN model class names to app waste categories and tips
 */
const CNN_CLASS_MAP = {
  battery:    { wasteType: 'E_WASTE',   recyclable: true,  tips: ['🔋 Take to e-waste collection center', '☠️ Never throw in regular trash', '♻️ Many stores accept used batteries', '⚡ Contains hazardous materials'] },
  biological: { wasteType: 'ORGANIC',   recyclable: true,  tips: ['🌱 Can be composted', '🌍 Reduces landfill waste', '🌿 Creates nutrient-rich soil', '♻️ Best for environment'] },
  cardboard:  { wasteType: 'PAPER',     recyclable: true,  tips: ['📦 Flatten all boxes before recycling', '🚿 Keep dry and clean', '🏷️ Remove tape and staples', '✅ Highly recyclable'] },
  clothes:    { wasteType: 'MIXED',     recyclable: true,  tips: ['👕 Donate if still wearable', '♻️ Textile recycling bins available', '✂️ Old clothes can be repurposed', '🌍 Reduces fashion waste'] },
  glass:      { wasteType: 'GLASS',     recyclable: true,  tips: ['🔴 100% recyclable', '🎨 Separate by color if possible', '🏷️ Remove labels', '✅ Excellent recycling material'] },
  metal:      { wasteType: 'METAL',     recyclable: true,  tips: ['💪 Crush cans to save space', '🧲 Highly magnetic material', '✨ Very valuable for recycling', '💰 Best recycling value'] },
  paper:      { wasteType: 'PAPER',     recyclable: true,  tips: ['📄 Keep dry and clean', '✂️ Flatten to save space', '🏷️ Remove plastic windows from envelopes', '🔐 Good for recycling'] },
  plastic:    { wasteType: 'PLASTIC',   recyclable: true,  tips: ['♻️ Rinse plastic before recycling', '🏷️ Remove labels and caps', '📦 Flatten to save space', '✅ Check recycling number on bottom'] },
  shoes:      { wasteType: 'MIXED',     recyclable: false, tips: ['👟 Donate if still wearable', '🏪 Some brands have take-back programs', '♻️ Specialized shoe recyclers exist', '🌍 Keep out of landfill'] },
  trash:      { wasteType: 'MIXED',     recyclable: false, tips: ['⚠️ General waste — sort before discarding', '🔍 Check if any items can be separated', '🗑️ Use general waste bin', '🌍 Minimize mixed waste generation'] },
};

/**
 * Call CNN predict_api.py with image buffer
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @returns {Object} { wasteType, confidence, recyclable, tips, category }
 */
const detectWasteWithCNN = async (imageBuffer, mimeType = 'image/jpeg') => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'waste.jpg',
      contentType: mimeType,
    });

    const response = await axios.post(`${CNN_API_URL}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 15000, // 15 second timeout
    });

    const { category, confidence } = response.data;

    // Find matching class key (case-insensitive)
    const classKey = Object.keys(CNN_CLASS_MAP).find(
      k => k.toLowerCase() === category.toLowerCase()
    ) || 'trash';

    const mapped = CNN_CLASS_MAP[classKey];

    return {
      success: true,
      classification: {
        wasteType: mapped.wasteType,
        confidence: confidence,
        recyclable: mapped.recyclable,
        tips: mapped.tips,
        detectedClass: category,
        description: `Detected as ${category} with ${Math.round(confidence * 100)}% confidence`
      }
    };
  } catch (err) {
    console.error('⚠️ CNN API Error:', err.message);
    return { success: false, error: err.message };
  }
};

// @desc    Create recycle request (with image upload)
// @route   POST /api/recycle
// @access  Private (Household only)
exports.createRecycleRequest = async (req, res, next) => {
  try {
    console.log('📥 Create recycle request:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      body: req.body,
      filesCount: req.files?.length || 0
    });

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
    let aiDetectedWasteType = null;
    let aiDetectionResult = null;

    if (req.files && req.files.length > 0) {
      console.log('📤 Uploading images to Cloudinary...');
      try {
        imageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycle');
        console.log('✅ Images uploaded:', imageUrls.length);

        // 🤖 CNN WASTE DETECTION — use first image buffer (before Cloudinary, from memory)
        const firstFile = req.files[0];
        if (firstFile && firstFile.buffer) {
          console.log('🤖 Running CNN waste detection...');
          aiDetectionResult = await detectWasteWithCNN(firstFile.buffer, firstFile.mimetype);

          if (aiDetectionResult.success && aiDetectionResult.classification) {
            aiDetectedWasteType = aiDetectionResult.classification.wasteType;
            console.log('✅ CNN Detection:', {
              detectedClass: aiDetectionResult.classification.detectedClass,
              wasteType: aiDetectedWasteType,
              confidence: aiDetectionResult.classification.confidence
            });
          } else {
            console.warn('⚠️ CNN Detection failed:', aiDetectionResult.error);
          }
        }
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError.message);
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
      aiDetectedWasteType: aiDetectedWasteType,
      aiDetectionResult: aiDetectionResult?.success ? {
        confidence: aiDetectionResult.classification.confidence,
        recyclable: aiDetectionResult.classification.recyclable,
        detectedItems: [aiDetectionResult.classification.detectedClass],
        tips: aiDetectionResult.classification.tips
      } : null,
      pickupLocation: {
        address: address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      status: 'AVAILABLE',
      assignedRecycler: null
    });

    console.log('✅ Recycle document created:', recycleRequest._id);

    // Update user stats
    try {
      await updateUserStats(req.user.id, 'RECYCLE_CREATED', {
        quantity: recycleRequest.quantity,
        wasteCategory: recycleRequest.wasteCategory
      });
    } catch (statsError) {
      console.error('⚠️ Failed to update user stats:', statsError.message);
    }

    // Build AI detection response for frontend
    const aiDetectionResponse = aiDetectionResult?.success && aiDetectionResult.classification ? {
      detected: true,
      wasteType: aiDetectionResult.classification.wasteType,
      confidence: aiDetectionResult.classification.confidence,
      recyclable: aiDetectionResult.classification.recyclable,
      tips: aiDetectionResult.classification.tips,
      description: aiDetectionResult.classification.description,
      detectedClass: aiDetectionResult.classification.detectedClass,
    } : {
      detected: false,
      message: 'AI detection not available'
    };

    res.status(201).json({
      success: true,
      message: 'Recycle request created successfully',
      data: {
        recycleRequest,
        aiDetection: aiDetectionResponse
      }
    });
  } catch (error) {
    console.error('❌ Error creating recycle request:', error.message);
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

    if (recycleRequest.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to access this recycle request', 403));
    }

    res.status(200).json({
      success: true,
      data: { recycleRequest }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recycle request
// @route   PUT /api/recycle/:id
// @access  Private (Household only)
exports.updateRecycleRequest = async (req, res, next) => {
  try {
    let recycleRequest = await Recycle.findById(req.params.id);

    if (!recycleRequest) {
      return next(new AppError('Recycle request not found', 404));
    }

    if (recycleRequest.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to update this recycle request', 403));
    }

    if (recycleRequest.status !== 'AVAILABLE') {
      return next(new AppError('Cannot update recycle request that has been accepted', 400));
    }

    const { wasteCategory, wasteType, quantity, unit, description } = req.body;
    const updateData = {};
    if (wasteCategory) updateData.wasteCategory = wasteCategory.toUpperCase();
    if (wasteType) updateData.wasteType = wasteType.toUpperCase();
    if (quantity) updateData.quantity = parseFloat(quantity);
    if (unit) updateData.unit = unit;
    if (description !== undefined) updateData.description = description;

    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadMultipleToCloudinary(req.files, 'ecoloop/recycle');
      updateData.images = [...recycleRequest.images, ...newImageUrls];
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

    if (recycleRequest.userId.toString() !== req.user.id) {
      return next(new AppError('Not authorized to delete this recycle request', 403));
    }

    if (recycleRequest.status !== 'AVAILABLE') {
      return next(new AppError('Cannot delete recycle request that has been accepted', 400));
    }

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
    next(error);
  }
};