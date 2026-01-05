const RequestAcceptance = require('../models/RequestAcceptance');
const RecyclerReview = require('../models/RecyclerReview');
const Recycler = require('../models/Recycler');
const Notification = require('../models/Notification');
const { calculateDistance, findNearbyRequests } = require('../utils/distanceCalculator');
const AppError = require('../utils/appError');
const axios = require('axios');

/**
 * Get all available recycle requests
 * @route GET /api/recycler/requests/available
 * @param {Object} req - Express request object
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Items per page (default: 10)
 * @returns {Object} List of available requests with pagination
 */
exports.getAvailableRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await RequestAcceptance.countDocuments({ status: 'ACCEPTED' });

    // Fetch available requests
    const requests = await RequestAcceptance.find({ status: 'ACCEPTED' })
      .select('-notes')
      .sort({ acceptedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(`✅ Fetched ${requests.length} available requests`);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get available requests error:', error);
    next(error);
  }
};

/**
 * Get nearby requests based on recycler location or city
 * @route GET /api/recycler/requests/nearby
 * @param {Object} req - Express request object
 * @param {number} req.query.latitude - Recycler latitude
 * @param {number} req.query.longitude - Recycler longitude
 * @param {number} req.query.radius - Search radius in km (default: 5)
 * @param {string} req.query.city - Filter by city name (optional)
 * @returns {Object} List of nearby requests sorted by distance
 */
exports.getNearbyRequests = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5, city } = req.query;

    // Validation
    if (!latitude || !longitude) {
      return next(new AppError('Please provide latitude and longitude', 400));
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    if (isNaN(lat) || isNaN(lon) || isNaN(searchRadius)) {
      return next(new AppError('Invalid coordinates or radius', 400));
    }

    // Build query with optional city filter
    let query = {
      status: 'ACCEPTED',
      'pickupLocation.latitude': { $exists: true },
      'pickupLocation.longitude': { $exists: true }
    };

    // If city filter is provided, filter by city name in address
    if (city && city.trim()) {
      query['pickupLocation.address'] = { $regex: city, $options: 'i' };
      console.log(`🏙️ Filtering requests by city: ${city}`);
    }

    // Get nearby requests
    const nearbyRequests = await RequestAcceptance.find(query).lean();

    // Calculate distances and filter
    const requestsWithDistance = nearbyRequests
      .map(req => ({
        ...req,
        distance: calculateDistance(
          lat,
          lon,
          req.pickupLocation.latitude,
          req.pickupLocation.longitude
        )
      }))
      .filter(req => req.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    const filterMsg = city ? ` from ${city}` : '';
    console.log(`✅ Found ${requestsWithDistance.length} nearby requests${filterMsg} within ${searchRadius}km`);

    res.status(200).json({
      success: true,
      data: requestsWithDistance,
      count: requestsWithDistance.length
    });
  } catch (error) {
    console.error('❌ Get nearby requests error:', error);
    next(error);
  }
};

/**
 * Accept a recycle request
 * @route POST /api/recycler/requests/:requestId/accept
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID
 * @param {string} req.params.requestId - Request ID to accept
 * @returns {Object} Updated request acceptance record
 */
exports.acceptRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const recyclerId = req.user.id;

    // Find existing acceptance
    const existingAcceptance = await RequestAcceptance.findOne({
      requestId,
      recyclerId
    });

    if (existingAcceptance) {
      return next(new AppError('You have already accepted this request', 409));
    }

    // Get request details from household backend
    let requestData;
    try {
      const response = await axios.get(
        `${process.env.HOUSEHOLD_API_URL}/api/recycle/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
          }
        }
      );
      requestData = response.data.data;
    } catch (apiError) {
      console.error('⚠️ Failed to fetch request from household backend:', apiError.message);
      return next(new AppError('Failed to fetch request details', 500));
    }

    // Create acceptance record
    const acceptance = new RequestAcceptance({
      requestId,
      householdId: requestData.userId,
      recyclerId,
      wasteCategory: requestData.category,
      quantity: requestData.quantity,
      unit: requestData.unit || 'KG',
      pickupLocation: {
        address: requestData.location?.address,
        latitude: requestData.location?.latitude,
        longitude: requestData.location?.longitude
      }
    });

    await acceptance.save();

    // Create notification for accepted request
    await Notification.create({
      recyclerId,
      title: '✅ New Request Accepted',
      message: `You accepted a waste request: ${requestData.quantity} ${requestData.unit} of ${requestData.category}`,
      type: 'REQUEST_ACCEPTED',
      data: {
        recycleId: requestId,
        category: requestData.category,
        quantity: requestData.quantity,
        unit: requestData.unit || 'KG',
        location: requestData.location?.address
      }
    });

    // Update recycler stats
    const recycler = await Recycler.findById(recyclerId);
    recycler.totalRequests += 1;
    await recycler.save();

    console.log(`✅ Request ${requestId} accepted by recycler ${recyclerId}`);

    res.status(201).json({
      success: true,
      message: 'Request accepted successfully',
      data: acceptance
    });
  } catch (error) {
    console.error('❌ Accept request error:', error);
    next(error);
  }
};

/**
 * Get recycler's accepted requests
 * @route GET /api/recycler/requests/my-requests
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID
 * @param {string} req.query.status - Filter by status (ACCEPTED, PICKED_UP, RECYCLED)
 * @returns {Object} List of recycler's requests
 */
exports.getMyRequests = async (req, res, next) => {
  try {
    const recyclerId = req.user.id;
    const { status } = req.query;

    // Build filter
    const filter = { recyclerId };
    if (status) {
      filter.status = status;
    }

    // Fetch requests
    const requests = await RequestAcceptance.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Fetched ${requests.length} requests for recycler ${recyclerId}`);

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('❌ Get my requests error:', error);
    next(error);
  }
};

/**
 * Update request status
 * @route PUT /api/recycler/requests/:id/status
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Recycler ID
 * @param {string} req.params.id - Request acceptance ID
 * @param {string} req.body.status - New status (PICKED_UP, RECYCLED)
 * @returns {Object} Updated request
 */
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const recyclerId = req.user.id;

    // Validation
    const validStatuses = ['PICKED_UP', 'RECYCLED'];
    if (!validStatuses.includes(status)) {
      return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
    }

    // Find acceptance record
    const acceptance = await RequestAcceptance.findById(id);
    if (!acceptance) {
      return next(new AppError('Request not found', 404));
    }

    // Verify ownership
    if (acceptance.recyclerId.toString() !== recyclerId) {
      return next(new AppError('You are not authorized to update this request', 403));
    }

    // Update status with timestamp
    acceptance.status = status;

    if (status === 'PICKED_UP') {
      acceptance.pickedUpAt = new Date();
      // Create notification
      await Notification.create({
        recyclerId,
        title: '🚗 Waste Picked Up',
        message: `You picked up: ${acceptance.quantity} ${acceptance.unit} of ${acceptance.wasteCategory}`,
        type: 'STATUS_UPDATE',
        data: {
          recycleId: acceptance.requestId,
          category: acceptance.wasteCategory,
          quantity: acceptance.quantity,
          unit: acceptance.unit
        }
      });
    } else if (status === 'RECYCLED') {
      acceptance.recycledAt = new Date();
      // Update recycler stats
      const recycler = await Recycler.findById(recyclerId);
      recycler.completedRequests += 1;
      recycler.totalWasteCollected += acceptance.quantity;
      await recycler.save();
      // Create notification
      await Notification.create({
        recyclerId,
        title: '♻️ Waste Recycled',
        message: `You completed recycling: ${acceptance.quantity} ${acceptance.unit} of ${acceptance.wasteCategory}`,
        type: 'STATUS_UPDATE',
        data: {
          recycleId: acceptance.requestId,
          category: acceptance.wasteCategory,
          quantity: acceptance.quantity,
          unit: acceptance.unit
        }
      });
    }

    await acceptance.save();

    console.log(`✅ Request status updated to ${status} for acceptance ${id}`);

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: acceptance
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    next(error);
  }
};

/**
 * Get request details
 * @route GET /api/recycler/requests/:id
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Request acceptance ID
 * @returns {Object} Request details with reviews
 */
exports.getRequestDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const acceptance = await RequestAcceptance.findById(id);
    if (!acceptance) {
      return next(new AppError('Request not found', 404));
    }

    console.log(`✅ Retrieved details for request ${id}`);

    res.status(200).json({
      success: true,
      data: acceptance
    });
  } catch (error) {
    console.error('❌ Get request details error:', error);
    next(error);
  }
};
