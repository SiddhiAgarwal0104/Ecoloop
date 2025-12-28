// controllers/waste.controller.js

const WasteLog = require('../models/WasteLog');
const User = require('../models/User');

// @desc    Log new waste
// @route   POST /api/waste/log
// @access  Private (Household only)
exports.logWaste = async (req, res) => {
  try {
    const { category, quantity, wasteDate, notes, aiPrediction } = req.body;

    // Support both JSON body and multipart form fields like 'quantity[value]'
    const quantityValue = (quantity && quantity.value) || req.body['quantity[value]'] || req.body.quantityValue || req.body.quantity;
    const quantityUnit = (quantity && quantity.unit) || req.body['quantity[unit]'] || req.body.quantityUnit || 'kg';

    // Get user's location
    const user = await User.findById(req.user.id);

    const wasteData = {
      user: req.user.id,
      category: category || (aiPrediction && aiPrediction.predictedCategory) || 'other',
      quantity: {
        value: Number(quantityValue) || 0,
        unit: quantityUnit || 'kg'
      },
      wasteDate: wasteDate || new Date(),
      location: {
        locality: user.address.locality,
        city: user.address.city,
        pincode: user.address.pincode,
        coordinates: user.address.coordinates
      },
      notes
    };

    // Add AI prediction if provided
    if (aiPrediction) {
      wasteData.aiPrediction = {
        isUsed: true,
        predictedCategory: aiPrediction.predictedCategory,
        confidence: aiPrediction.confidence,
        suggestions: aiPrediction.suggestions,
        wasModified: aiPrediction.predictedCategory !== category
      };
    }

    // Add image if uploaded
    if (req.file) {
      wasteData.image = {
        url: req.file.path,
        publicId: req.file.filename,
        uploadedAt: new Date()
      };
    }

    // Create waste log
    const wasteLog = await WasteLog.create(wasteData);

    // Calculate environmental impact
    wasteLog.calculateImpact();
    await wasteLog.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        'stats.totalWasteLogged': quantity.value,
        'stats.co2Saved': wasteLog.impact.co2SavedKg
      }
    });

    res.status(201).json({
      success: true,
      message: 'Waste logged successfully',
      data: wasteLog
    });

  } catch (error) {
    console.error('Log waste error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log waste',
      error: error.message
    });
  }
};

// @desc    Get user's waste logs
// @route   GET /api/waste/my-logs
// @access  Private
exports.getMyLogs = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const query = {
      user: req.user.id,
      isDeleted: false
    };

    // Date filter
    if (startDate || endDate) {
      query.wasteDate = {};
      if (startDate) query.wasteDate.$gte = new Date(startDate);
      if (endDate) query.wasteDate.$lte = new Date(endDate);
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    const logs = await WasteLog.find(query)
      .sort('-wasteDate')
      .limit(100);

    // Get stats
    const stats = await WasteLog.getUserStats(
      req.user.id,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
      stats
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waste logs',
      error: error.message
    });
  }
};

// @desc    Get single waste log
// @route   GET /api/waste/log/:id
// @access  Private
exports.getWasteLog = async (req, res) => {
  try {
    const wasteLog = await WasteLog.findById(req.params.id);

    if (!wasteLog) {
      return res.status(404).json({
        success: false,
        message: 'Waste log not found'
      });
    }

    // Check ownership
    if (wasteLog.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this log'
      });
    }

    res.status(200).json({
      success: true,
      data: wasteLog
    });

  } catch (error) {
    console.error('Get waste log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waste log',
      error: error.message
    });
  }
};

// @desc    Update waste log
// @route   PUT /api/waste/log/:id
// @access  Private
exports.updateWasteLog = async (req, res) => {
  try {
    let wasteLog = await WasteLog.findById(req.params.id);

    if (!wasteLog) {
      return res.status(404).json({
        success: false,
        message: 'Waste log not found'
      });
    }

    // Check ownership
    if (wasteLog.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this log'
      });
    }

    const { category, quantity, notes } = req.body;

    // Update fields
    if (category) wasteLog.category = category;
    if (quantity) {
      wasteLog.quantity.value = quantity.value;
      if (quantity.unit) wasteLog.quantity.unit = quantity.unit;
    }
    if (notes !== undefined) wasteLog.notes = notes;

    // Recalculate impact
    wasteLog.calculateImpact();
    await wasteLog.save();

    res.status(200).json({
      success: true,
      message: 'Waste log updated successfully',
      data: wasteLog
    });

  } catch (error) {
    console.error('Update waste log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update waste log',
      error: error.message
    });
  }
};

// @desc    Delete waste log
// @route   DELETE /api/waste/log/:id
// @access  Private
exports.deleteWasteLog = async (req, res) => {
  try {
    const wasteLog = await WasteLog.findById(req.params.id);

    if (!wasteLog) {
      return res.status(404).json({
        success: false,
        message: 'Waste log not found'
      });
    }

    // Check ownership
    if (wasteLog.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this log'
      });
    }

    // Soft delete
    wasteLog.isDeleted = true;
    await wasteLog.save();

    res.status(200).json({
      success: true,
      message: 'Waste log deleted successfully'
    });

  } catch (error) {
    console.error('Delete waste log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete waste log',
      error: error.message
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/waste/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Last 30 days data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get user stats
    const userStats = await WasteLog.getUserStats(req.user.id, thirtyDaysAgo);

    // Total counts
    const totalLogs = await WasteLog.countDocuments({
      user: req.user.id,
      isDeleted: false
    });

    // Recent logs
    const recentLogs = await WasteLog.find({
      user: req.user.id,
      isDeleted: false
    })
      .sort('-createdAt')
      .limit(5);

    // Community comparison (optional)
    const communityStats = await WasteLog.getCommunityStats(
      user.address.locality,
      thirtyDaysAgo
    );

    res.status(200).json({
      success: true,
      data: {
        userStats,
        totalLogs,
        recentLogs,
        communityStats,
        userProfile: {
          name: user.name,
          stats: user.stats,
          locality: user.address.locality
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// @desc    AI prediction for waste image
// @route   POST /api/waste/predict
// @access  Private
exports.predictWaste = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // TODO: Integrate actual AI model
    // For now, return dummy prediction
    const dummyPrediction = {
      predictedCategory: 'plastic',
      confidence: 85,
      suggestions: [
        { category: 'plastic', confidence: 85 },
        { category: 'dry', confidence: 70 },
        { category: 'metal', confidence: 45 }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Prediction generated',
      data: dummyPrediction,
      imageUrl: req.file.path
    });

  } catch (error) {
    console.error('Predict waste error:', error);
    res.status(500).json({
      success: false,
      message: 'Prediction failed',
      error: error.message
    });
  }
};