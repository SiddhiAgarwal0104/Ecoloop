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
    } = req.body;

    // Check if user has location data
    if (!req.user.location || typeof req.user.location.latitude !== 'number' || typeof req.user.location.longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'User location is incomplete. Please update your profile with latitude and longitude before creating requests.',
      });
    }

    // Use city or locality or a default fallback
    const city = (req.user.city || req.user.locality || 'unknown').toLowerCase().trim();
    const locality = (req.user.locality || 'Not Set').toLowerCase().trim();
    const pincode = (req.user.pincode || '000000').toString().trim();

    const request = await CommunityRequest.create({
      itemName,
      category,
      description,
      requesterId: req.user.id,

      city: city,
      locality: locality,
      pincode: pincode,
      location: {
        latitude: req.user.location.latitude,
        longitude: req.user.location.longitude,
      },

      startDate,
      endDate,
      status: 'OPEN',
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
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
      location: req.user.location,
    });
    
    // Use city or locality or a default fallback
    const city = (req.user.city || req.user.locality || 'unknown').toLowerCase().trim();
    
    // Check if user has location data
    if (!req.user.location || !req.user.location.latitude || !req.user.location.longitude) {
      console.log("⚠️ User missing location data");
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Please complete your profile with location information to see nearby requests.',
        radius: RADIUS_KM,
      });
    }

    const userLat = req.user.location.latitude;
    const userLon = req.user.location.longitude;

    const { status, category } = req.query;

    const query = {
      city,
      requesterId: { $ne: req.user.id },
    };

    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['OPEN', 'NEGOTIATING'] };
    }

    if (category) {
      query.category = category;
    }

    // Get all requests in the city
    const allRequests = await CommunityRequest.find(query)
      .populate('requesterId', 'name email phone')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`📦 Found ${allRequests.length} requests in city: ${city}`);

    // Filter requests within 10 km radius
    const nearbyRequests = allRequests.filter(req => {
      if (!req.location || !req.location.latitude || !req.location.longitude) {
        return false; // Skip requests without location data
      }
      
      const distance = calculateDistance(
        userLat,
        userLon,
        req.location.latitude,
        req.location.longitude
      );
      
      // Add distance to the request object for frontend display
      req.distance = parseFloat(distance.toFixed(2));
      
      return distance <= RADIUS_KM;
    });

    console.log(`✅ Found ${nearbyRequests.length} requests within ${RADIUS_KM} km`);

    res.status(200).json({
      success: true,
      data: nearbyRequests,
      radius: RADIUS_KM,
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