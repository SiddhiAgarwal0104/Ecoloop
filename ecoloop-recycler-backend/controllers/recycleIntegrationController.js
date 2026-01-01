const axios = require('axios');
const RequestAcceptance = require('../models/RequestAcceptance');
const Recycle = require('../models/Recycle');
const Recycler = require('../models/Recycler');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const { emitNewRecycleRequest, broadcastNotification } = require('../utils/socketService');
const { calculateDistance } = require('../utils/distanceCalculator');

/**
 * Get a single recycle request by ID
 * @route GET /api/integration/recycle/:recycleId
 * @access Private (Recycler only)
 */
exports.getRecycleDetails = async (req, res, next) => {
  try {
    const { recycleId } = req.params;
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found', 401));
    }

    if (!recycleId) {
      return next(new AppError('Recycle request ID is required', 400));
    }

    // Get the recycle request (don't populate userId - it's from household backend)
    const recycle = await Recycle.findOne({ 
      _id: recycleId, 
      assignedRecycler: recyclerId 
    });

    if (!recycle) {
      return next(new AppError('Recycle request not found or you are not assigned to it', 404));
    }

    console.log(`✅ Fetched recycle details for ${recycleId}`);

    res.status(200).json({
      success: true,
      data: recycle,
      message: 'Recycle request details retrieved'
    });
  } catch (error) {
    console.error('❌ Error fetching recycle details:', error);
    next(error);
  }
};

/**
 * Get available recycle requests from household backend
 * Filters by recycler's location (distance or city) to show nearby requests
 * @route GET /api/integration/recycle/available
 * @access Private (Recycler only)
 */
exports.getAvailableRecycles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'AVAILABLE', radius = 10, city } = req.query;
    const recyclerId = req.user?.id;
    
    console.log(`📥 Getting available recycles for recycler: ${recyclerId}`);
    
    // Get recycler's location from profile
    let recyclerLat = null;
    let recyclerLng = null;
    let recyclerCity = null;
    
    if (recyclerId) {
      try {
        const recycler = await Recycler.findById(recyclerId).select('latitude longitude address');
        if (recycler) {
          recyclerLat = recycler.latitude;
          recyclerLng = recycler.longitude;
          console.log(`📍 Recycler location: (${recyclerLat}, ${recyclerLng}), Address: ${recycler.address}`);
        }
      } catch (err) {
        console.error('⚠️ Error fetching recycler location:', err.message);
      }
    }

    try {
      // Fetch available requests from local Recycle model (synced from household)
      console.log(`🔍 Fetching available recycles from local database`);
      const allRecycles = await Recycle.find({
        status: 'AVAILABLE'
      }).sort({ createdAt: -1 }).lean();

      let recycles = allRecycles;
      console.log(`✅ Fetched ${recycles.length} total available requests from database`);
      
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
        console.log(`🔍 Filtering ${allRecycles.length} requests by distance. Recycler: (${recyclerLat}, ${recyclerLng}), Radius: ${searchRadius}km`);
        
        recycles = allRecycles.filter(req => {
          try {
            const pickupLat = req.pickupLocation?.latitude || 0;
            const pickupLng = req.pickupLocation?.longitude || 0;
            
            const distance = calculateDistance(recyclerLat, recyclerLng, pickupLat, pickupLng);
            console.log(`   Request ${req._id?.toString().slice(-6)}: Distance = ${distance.toFixed(2)}km from (${pickupLat}, ${pickupLng}), Within radius: ${distance <= searchRadius}`);
            
            return distance <= searchRadius;
          } catch (err) {
            console.error('Error calculating distance:', err);
            return true; // Include if calculation fails
          }
        });
        
        console.log(`✅ Filtered to ${recycles.length} requests within ${searchRadius}km of recycler`);
      } else if (!city) {
        console.log(`⚠️ Recycler location not found (lat: ${recyclerLat}, lng: ${recyclerLng}), returning all requests`);
      }

      // Apply pagination on filtered results
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
        message: `${paginatedRecycles.length} waste requests available near you`
      });
    } catch (error) {
      console.error('❌ Error fetching recycles from database:', error.message);
      next(new AppError(`Failed to fetch waste requests: ${error.message}`, 503));
    }
  } catch (error) {
    console.error('❌ Error in getAvailableRecycles:', error.message);
    next(new AppError(`Failed to fetch waste requests: ${error.message}`, 503));
  }
};

/**
 * Accept a recycle request from household
 * @route POST /api/integration/recycle/:recycleId/accept
 * @access Private (Recycler only)
 */
exports.acceptRecycle = async (req, res, next) => {
  try {
    const { recycleId } = req.params;
    const recyclerId = req.user?.id;

    console.log(`📥 Accept request received`);
    console.log(`   - Recycle ID: ${recycleId}`);
    console.log(`   - Recycler ID: ${recyclerId}`);
    console.log(`   - User object:`, req.user);

    if (!recyclerId) {
      console.log(`❌ No recycler ID in req.user`);
      return next(new AppError('Recycler ID not found in request', 401));
    }

    if (!recycleId) {
      return next(new AppError('Recycle request ID is required', 400));
    }

    // Query the local Recycle model directly (same MongoDB, shared collection)
    const recycle = await Recycle.findById(recycleId);
    console.log(`🔍 Looking for recycle with ID: ${recycleId}`);
    
    if (!recycle) {
      console.log(`❌ Recycle not found with ID: ${recycleId}`);
      console.log(`📊 Searching in Recycle collection...`);
      const count = await Recycle.countDocuments();
      console.log(`   Total recycles in DB: ${count}`);
      return next(new AppError('Recycle request not found', 404));
    }

    console.log(`✅ Found recycle!`);
    console.log(`   - Current status: ${recycle.status}`);
    console.log(`   - Current assignedRecycler: ${recycle.assignedRecycler}`);
    console.log(`   - Recycle data:`, recycle);

    if (recycle.status !== 'AVAILABLE') {
      console.log(`⚠️ Recycle status is ${recycle.status}, not AVAILABLE`);
      return next(new AppError(`This request has already been accepted (status: ${recycle.status})`, 400));
    }

    // Update recycle status directly in the shared Recycle collection
    recycle.status = 'ACCEPTED';
    recycle.assignedRecycler = recyclerId;
    recycle.acceptedAt = new Date();
    
    // If userName is empty, set a default (user details should be populated when recycle was created)
    if (!recycle.userName) {
      recycle.userName = 'User';
      console.log(`⚠️ No userName found for recycle ${recycleId}`);
    }
    
    await recycle.save();

    // Update recycler stats
    await Recycler.findByIdAndUpdate(
      recyclerId,
      { $inc: { totalRequests: 1 } },
      { new: true }
    );

    console.log(`✅ Recycle ${recycleId} updated successfully`);
    console.log(`   - New status: ${recycle.status}`);
    console.log(`   - New assignedRecycler: ${recycle.assignedRecycler}`);

    // 🚨 CREATE NOTIFICATION IN DATABASE
    try {
      const notification = await Notification.create({
        recyclerId: recyclerId,
        title: '✅ New Pickup Accepted',
        message: `You accepted a waste request for ${recycle.wasteCategory} (${recycle.quantity} ${recycle.unit})`,
        type: 'REQUEST_ACCEPTED',
        data: {
          recycleId: recycle._id,
          category: recycle.wasteCategory,
          quantity: recycle.quantity,
          unit: recycle.unit,
          location: recycle.pickupLocation?.address,
          acceptedAt: new Date()
        }
      });
      console.log(`✅ Notification created in database:`, notification._id);
    } catch (notifError) {
      console.error(`❌ Error creating notification:`, notifError.message);
      console.error(`   - Full error:`, notifError);
    }

    // Emit socket notification about the accepted request
    broadcastNotification({
      type: 'REQUEST_ACCEPTED',
      title: '✅ Request Accepted',
      message: `A waste request for ${recycle.wasteCategory} (${recycle.quantity} ${recycle.unit}) has been accepted by a recycler`,
      data: {
        recycleId: recycle._id,
        category: recycle.wasteCategory,
        quantity: recycle.quantity,
        unit: recycle.unit,
        location: recycle.pickupLocation?.address,
        acceptedBy: recyclerId
      }
    });

    res.status(200).json({
      success: true,
      message: 'Recycle request accepted successfully',
      data: recycle
    });
  } catch (error) {
    console.error('❌ Error accepting recycle request:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack:`, error.stack);
    next(error);
  }
};

/**
 * Get recycler's accepted recycle requests
 * @route GET /api/integration/recycle/my-requests
 * @access Private (Recycler only)
 */
exports.getMyRecycleRequests = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found', 401));
    }

    console.log(`📥 Fetching accepted recycles for recycler: ${recyclerId}`);
    console.log(`   - Status filter: ${status || 'ALL'}`);
    console.log(`   - Page: ${page}, Limit: ${limit}`);

    const query = { assignedRecycler: recyclerId };
    
    if (status) {
      query.status = status.toUpperCase();
    }

    console.log(`🔍 Query:`, query);

    const skip = (page - 1) * limit;
    const requests = await Recycle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recycle.countDocuments(query);

    console.log(`✅ Found ${requests.length} accepted recycles for recycler ${recyclerId}`);
    console.log(`   - Total matching: ${total}`);
    if (requests.length > 0) {
      console.log(`   - First request:`, requests[0]);
    }

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
    console.error('❌ Error fetching recycler requests:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack:`, error.stack);
    next(error);
  }
};

/**
 * Update recycle request status (PICKED_UP, RECYCLED, etc.)
 * @route PUT /api/integration/recycle/:recycleId/status
 * @access Private (Recycler only)
 */
exports.updateRecycleStatus = async (req, res, next) => {
  try {
    const { recycleId } = req.params;
    const { status } = req.body;
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found', 401));
    }

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const validStatuses = ['PICKED_UP', 'RECYCLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const recycle = await Recycle.findOneAndUpdate(
      { _id: recycleId, assignedRecycler: recyclerId },
      { status: status.toUpperCase() },
      { new: true }
    );

    if (!recycle) {
      return next(new AppError('Recycle request not found or unauthorized', 404));
    }

    console.log(`✅ Recycle request ${recycleId} status updated to ${status}`);

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

/**
 * Get recycler stats (real-time calculation)
 * @route GET /api/integration/recycler/stats
 * @access Private (Recycler only)
 */
exports.getRecyclerStats = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return next(new AppError('Recycler ID not found', 401));
    }

    console.log(`📊 Calculating stats for recycler: ${recyclerId}`);

    // Get all requests assigned to this recycler
    const totalRequests = await Recycle.countDocuments({ assignedRecycler: recyclerId });
    
    // Get completed requests (RECYCLED status)
    const completedRequests = await Recycle.countDocuments({ 
      assignedRecycler: recyclerId, 
      status: 'RECYCLED' 
    });

    // Calculate completion rate
    const completionRate = totalRequests > 0 
      ? Math.round((completedRequests / totalRequests) * 100) 
      : 0;

    console.log(`✅ Stats calculated:`);
    console.log(`   - Total Requests: ${totalRequests}`);
    console.log(`   - Completed: ${completedRequests}`);
    console.log(`   - Completion Rate: ${completionRate}%`);

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        completedRequests,
        completionRate
      },
      message: 'Recycler stats retrieved'
    });
  } catch (error) {
    console.error('❌ Error calculating stats:', error);
    next(error);
  }
};

/**
 * Test notification (for development only)
 * @route GET /api/integration/recycle/test-notification
 * @access Private (Recycler only)
 */
exports.testNotification = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;

    console.log(`📨 Sending test notification for recycler: ${recyclerId}`);

    broadcastNotification({
      type: 'REQUEST_ACCEPTED',
      title: '✅ Test Notification',
      message: `This is a test notification. Your socket.io connection is working!`,
      data: {
        recycleId: 'TEST-' + Date.now(),
        category: 'PLASTIC',
        quantity: 10,
        unit: 'KG',
        location: 'Test Location'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    next(error);
  }
};

/**
 * Get socket connection status (for diagnostics)
 * @route GET /api/integration/recycle/socket-status
 * @access Private (Recycler only)
 */
exports.getSocketStatus = async (req, res, next) => {
  try {
    const { getConnectedUsersInfo } = require('../utils/socketService');
    const status = getConnectedUsersInfo();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Error getting socket status:', error);
    next(error);
  }
};

/**
 * Create test database notification (for debugging)
 * @route POST /api/integration/recycle/test-db-notification
 * @access Private (Recycler only)
 */
exports.testDBNotification = async (req, res, next) => {
  try {
    const recyclerId = req.user?.id;

    console.log(`📨 Creating test DB notification for recycler: ${recyclerId}`);

    const notification = await Notification.create({
      recyclerId: recyclerId,
      title: '✅ Test Database Notification',
      message: `This is a test notification stored directly in the database!`,
      type: 'REQUEST_ACCEPTED',
      data: {
        recycleId: 'TEST-DB-' + Date.now(),
        category: 'PLASTIC',
        quantity: 10,
        unit: 'KG',
        location: 'Test Location'
      }
    });

    console.log(`✅ Test DB notification created:`, notification._id);

    res.status(200).json({
      success: true,
      message: 'Test DB notification created',
      data: notification
    });
  } catch (error) {
    console.error('❌ Error creating test DB notification:', error);
    next(error);
  }
};

