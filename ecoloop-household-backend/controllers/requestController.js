const CommunityRequest = require('../models/CommunityRequest');
const ChatRoom = require('../models/ChatRoom');
const { calculateDistance } = require('../utils/distanceCalculator');

/**
 * CREATE REQUEST
 */
const createRequest = async (req, res) => {
  try {
    const {
      itemName,
      category,
      description,
      startDate,
      endDate,
      locality,
      pincode,
      latitude,
      longitude,
    } = req.body;

    console.log('📝 Creating request:', {
      itemName,
      userCity: req.user.city,
      userLocality: req.user.locality,
      userLocation: req.user.location,
      formLocality: locality,
      formLatitude: latitude,
      formLongitude: longitude,
    });

    // Determine location - use form data if provided, otherwise use user profile data
    let finalLatitude, finalLongitude;
    
    if (latitude && longitude) {
      // Use location from form (map selection)
      finalLatitude = parseFloat(latitude);
      finalLongitude = parseFloat(longitude);
      console.log('  ✅ Using location from form');
    } else if (req.user.location && typeof req.user.location.latitude === 'number' && typeof req.user.location.longitude === 'number') {
      // Use location from user profile
      finalLatitude = req.user.location.latitude;
      finalLongitude = req.user.location.longitude;
      console.log('  ✅ Using location from user profile');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Location is incomplete. Please either select a location on the map or update your profile with location data.',
      });
    }

    // Use form data if provided, otherwise use user profile data
    const finalLocality = (locality || req.user.locality || 'Not Set').toLowerCase().trim();
    const finalPincode = (pincode || req.user.pincode || '000000').toString().trim();
    const city = (req.user.city || req.user.locality || 'unknown').toLowerCase().trim();

    console.log('  📍 Final location:', {
      city,
      locality: finalLocality,
      pincode: finalPincode,
      latitude: finalLatitude,
      longitude: finalLongitude,
    });

    const request = await CommunityRequest.create({
      itemName,
      category,
      description,
      requesterId: req.user.id,

      city: city,
      locality: finalLocality,
      pincode: finalPincode,
      location: {
        latitude: finalLatitude,
        longitude: finalLongitude,
      },

      startDate,
      endDate,
      status: 'OPEN',
    });

    console.log('  ✅ Request created successfully:', request._id);

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error('❌ Error creating request:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET COMMUNITY REQUESTS (within 10 km radius)
 * Filter requests by distance (10 km radius)
 */

const RADIUS_KM = 10; // 10 km radius

const getLocalityRequests = async (req, res) => {
  try {
    console.log("📍 USER INFO:", {
      id: req.user.id,
      city: req.user.city,
      locality: req.user.locality,
      location: req.user.location,
    });
    
    const { status, category } = req.query;

    const query = {
      requesterId: { $ne: req.user.id },
    };

    // Add status filter (default: OPEN and NEGOTIATING)
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['OPEN', 'NEGOTIATING'] };
    }

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add city filter - must match user's city
    const city = (req.user.city || req.user.locality || '').toLowerCase().trim();
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City information not found in your profile. Please update your profile with city/locality.',
      });
    }
    
    query.city = city;
    console.log(`🔍 Filtering by city: "${city}"`);
    console.log(`📋 Query:`, JSON.stringify(query, null, 2));

    // Get all requests from the same city
    let allRequests = await CommunityRequest.find(query)
      .populate('requesterId', 'name email phone')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`📦 Found ${allRequests.length} requests in city: "${city}"`);
    
    // If no requests found in the city, try locality as fallback
    if (allRequests.length === 0) {
      console.log(`⚠️  No requests found for city "${city}", trying locality fallback`);
      const locality = (req.user.locality || '').toLowerCase().trim();
      if (locality && locality !== city) {
        const fallbackQuery = {
          ...query,
          city: undefined, // Remove city filter
          locality: locality,
        };
        allRequests = await CommunityRequest.find(fallbackQuery)
          .populate('requesterId', 'name email phone')
          .populate('acceptedBy', 'name email')
          .sort({ createdAt: -1 });
        console.log(`📦 Found ${allRequests.length} requests in locality: "${locality}"`);
      }
    }

    // If user has location data, filter by distance
    if (req.user.location && req.user.location.latitude && req.user.location.longitude) {
      const userLat = req.user.location.latitude;
      const userLon = req.user.location.longitude;
      
      console.log(`📍 User location: (${userLat}, ${userLon})`);
      console.log(`🎯 Calculating distances for ${allRequests.length} requests...`);

      // Separate requests with location data from those without
      const requestsWithLocation = [];
      const requestsWithoutLocation = [];

      allRequests.forEach(reqItem => {
        if (reqItem.location && reqItem.location.latitude && reqItem.location.longitude) {
          requestsWithLocation.push(reqItem);
        } else {
          requestsWithoutLocation.push(reqItem);
        }
      });

      console.log(`  📊 ${requestsWithLocation.length} with location, ${requestsWithoutLocation.length} without`);

      // Filter requests within 10 km radius
      const nearbyRequests = requestsWithLocation.filter(reqItem => {
        const distance = calculateDistance(
          userLat,
          userLon,
          reqItem.location.latitude,
          reqItem.location.longitude
        );
        
        // Add distance to the request object for frontend display
        reqItem.distance = parseFloat(distance.toFixed(2));
        
        const isNearby = distance <= RADIUS_KM;
        console.log(`  ${isNearby ? '✅' : '❌'} Request "${reqItem.itemName}" - ${distance.toFixed(2)} km away`);
        
        return isNearby;
      });

      // Include requests without location data (they're in the same city, so assume nearby)
      const finalRequests = [...nearbyRequests, ...requestsWithoutLocation];
      
      console.log(`✅ Found ${nearbyRequests.length} requests within ${RADIUS_KM} km + ${requestsWithoutLocation.length} requests without location data = ${finalRequests.length} total`);

    res.status(200).json({
      success: true,
      data: finalRequests,
      radius: RADIUS_KM,
      debug: {
        userCity: city,
        userLocation: { lat: req.user.location?.latitude, lon: req.user.location?.longitude },
        totalRequestsInCity: allRequests.length,
        requestsWithLocation: requestsWithLocation.length,
        requestsWithoutLocation: requestsWithoutLocation.length,
        nearbyCount: nearbyRequests.length,
      },
      message: `Found ${finalRequests.length} requests in your area`,
      });
    }

    // If no location data, return all requests without distance filtering
    console.log(`✅ Returning ${allRequests.length} requests (no location filtering)`);
    res.status(200).json({
      success: true,
      data: allRequests,
      debug: {
        userCity: city,
        message: 'No user location data, showing all requests in your city',
      },
      message: 'Showing all available requests (no location data to filter)',
    });
  } catch (err) {
    console.error("❌ Error fetching requests:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/**
 * GET MY REQUESTS
 */


const getMyRequests = async (req, res) => {
  try {
    console.log("USER CITY:", req.user.city);
    console.log("USER ID:", req.user.id);
    const requests = await CommunityRequest.find({
      requesterId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET REQUEST BY ID
 */


const getRequestById = async (req, res) => {
  try {
    console.log("USER CITY:", req.user.city);
    console.log("USER ID:", req.user.id);
    const request = await CommunityRequest.findById(req.params.id)
      .populate('requesterId', 'name email')
      .populate('acceptedBy', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * SHOW INTEREST
 */
const showInterest = async (req, res) => {
  try {
    console.log("🔍 showInterest called for request:", req.params.id);
    console.log("👤 Current user:", req.user.id);
    
    const request = await CommunityRequest.findById(req.params.id);

    if (!request) {
      console.log("❌ Request not found");
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    console.log("📋 Request details:", {
      id: request._id,
      requesterId: request.requesterId.toString(),
      status: request.status,
    });

    if (request.requesterId.toString() === req.user.id.toString()) {
      console.log("❌ User trying to interest own request");
      return res.status(400).json({ success: false, message: 'Cannot interest own request' });
    }

    if (!['OPEN', 'NEGOTIATING'].includes(request.status)) {
      console.log("❌ Request not available, status:", request.status);
      return res.status(400).json({ success: false, message: 'Request not available' });
    }

    const existingChat = await ChatRoom.findOne({
      requestId: request._id,
      'participants.userId': req.user.id,
    });

    if (existingChat) {
      console.log("✅ Chat room already exists:", existingChat._id);
      return res.status(200).json({ success: true, data: existingChat });
    }

    const chatRoom = await ChatRoom.create({
      requestId: request._id,
      participants: [
        { userId: request.requesterId, role: 'requester' },
        { userId: req.user.id, role: 'lender' },
      ],
    });

    console.log("✅ Chat room created:", chatRoom._id);

    request.status = 'NEGOTIATING';
    await request.save();

    console.log("✅ Request status updated to NEGOTIATING");

    res.status(201).json({ success: true, data: chatRoom });
  } catch (err) {
    console.error("❌ showInterest error:", {
      message: err.message,
      stack: err.stack,
      requestId: req.params.id,
    });
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ACTIVE LENDINGS
 */
const getActiveLendings = async (req, res) => {
  try {
    const lendings = await CommunityRequest.find({
      acceptedBy: req.user.id,
      status: { $in: ['CONFIRMED', 'ACTIVE'] },
    })
      .populate('requesterId', 'name email')
      .populate('acceptedBy', 'name email');

    res.status(200).json({ success: true, data: lendings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CANCEL REQUEST
 */
const cancelRequest = async (req, res) => {
  try {
    console.log("🗑️ Cancel request called");
    console.log("📝 Request ID:", req.params.id);
    console.log("👤 User ID:", req.user.id);

    const request = await CommunityRequest.findById(req.params.id);

    if (!request) {
      console.log("❌ Request not found");
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    console.log("📋 Request details:", {
      id: request._id,
      requesterId: request.requesterId.toString(),
      userId: req.user.id.toString(),
    });

    // Proper ObjectId comparison
    if (request.requesterId.toString() !== req.user.id.toString()) {
      console.log("❌ Not authorized to cancel this request");
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    request.status = 'CANCELLED';
    await request.save();

    console.log("✅ Request cancelled successfully");

    res.status(200).json({ 
      success: true,
      data: request,
      message: 'Request cancelled successfully'
    });
  } catch (err) {
    console.error("❌ Cancel request error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRequest,
  getLocalityRequests,
  getMyRequests,
  getRequestById,
  showInterest,
  getActiveLendings,
  cancelRequest,
};