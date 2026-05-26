const CommunityRequest = require('../models/CommunityRequest');
const ChatRoom = require('../models/ChatRoom');
const { calculateDistance } = require('../utils/distanceCalculator');
const { createNotification } = require('../utils/notificationHelper');

const createRequest = async (req, res) => {
  try {
    const { itemName, category, description, startDate, endDate, locality, pincode, latitude, longitude } = req.body;

    let finalLatitude, finalLongitude;
    if (latitude && longitude) {
      finalLatitude = parseFloat(latitude);
      finalLongitude = parseFloat(longitude);
    } else if (req.user.location && typeof req.user.location.latitude === 'number' && typeof req.user.location.longitude === 'number') {
      finalLatitude = req.user.location.latitude;
      finalLongitude = req.user.location.longitude;
    } else {
      return res.status(400).json({ success: false, message: 'Location is incomplete.' });
    }

    const finalLocality = (locality || req.user.locality || 'Not Set').toLowerCase().trim();
    const finalPincode = (pincode || req.user.pincode || '000000').toString().trim();
    const city = (req.user.city || req.user.locality || 'unknown').toLowerCase().trim();

    const request = await CommunityRequest.create({
      itemName, category, description,
      requesterId: req.user.id,
      city, locality: finalLocality, pincode: finalPincode,
      location: { latitude: finalLatitude, longitude: finalLongitude },
      startDate, endDate, status: 'OPEN',
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error('❌ Error creating request:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const RADIUS_KM = 10;

const getLocalityRequests = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { requesterId: { $ne: req.user.id } };

    if (status) query.status = status;
    else query.status = { $in: ['OPEN', 'NEGOTIATING'] };
    if (category) query.category = category;

    const city = (req.user.city || req.user.locality || '').toLowerCase().trim();
    if (!city) return res.status(400).json({ success: false, message: 'City not found in profile.' });

    query.city = city;

    let allRequests = await CommunityRequest.find(query)
      .populate('requesterId', 'name email phone')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });

    if (allRequests.length === 0) {
      const locality = (req.user.locality || '').toLowerCase().trim();
      if (locality && locality !== city) {
        const fallbackQuery = { ...query, city: undefined, locality };
        allRequests = await CommunityRequest.find(fallbackQuery)
          .populate('requesterId', 'name email phone')
          .populate('acceptedBy', 'name email')
          .sort({ createdAt: -1 });
      }
    }

    if (req.user.location?.latitude && req.user.location?.longitude) {
      const userLat = req.user.location.latitude;
      const userLon = req.user.location.longitude;

      const requestsWithLocation = [];
      const requestsWithoutLocation = [];

      allRequests.forEach(r => {
        if (r.location?.latitude && r.location?.longitude) requestsWithLocation.push(r);
        else requestsWithoutLocation.push(r);
      });

      const nearbyRequests = requestsWithLocation.filter(r => {
        const distance = calculateDistance(userLat, userLon, r.location.latitude, r.location.longitude);
        r.distance = parseFloat(distance.toFixed(2));
        return distance <= RADIUS_KM;
      });

      const finalRequests = [...nearbyRequests, ...requestsWithoutLocation];
      return res.status(200).json({ success: true, data: finalRequests, radius: RADIUS_KM });
    }

    res.status(200).json({ success: true, data: allRequests });
  } catch (err) {
    console.error('❌ Error fetching requests:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await CommunityRequest.find({ requesterId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id)
      .populate('requesterId', 'name email')
      .populate('acceptedBy', 'name email');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const showInterest = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (request.requesterId.toString() === req.user.id.toString())
      return res.status(400).json({ success: false, message: 'Cannot interest own request' });

    if (!['OPEN', 'NEGOTIATING'].includes(request.status))
      return res.status(400).json({ success: false, message: 'Request not available' });

    const existingChat = await ChatRoom.findOne({
      requestId: request._id,
      'participants.userId': req.user.id,
    });

    if (existingChat) return res.status(200).json({ success: true, data: existingChat });

    const chatRoom = await ChatRoom.create({
      requestId: request._id,
      participants: [
        { userId: request.requesterId, role: 'requester' },
        { userId: req.user.id, role: 'lender' },
      ],
    });

    request.status = 'NEGOTIATING';
    await request.save();

    // ✅ Notify requester
    await createNotification({
      userId: request.requesterId,
      title: 'New Interest in Your Request',
      message: `Someone is interested in lending "${request.itemName}"!`,
      type: 'COMMUNITY_INTEREST',
      relatedId: chatRoom._id,
      relatedType: 'ChatRoom'
    });

    res.status(201).json({ success: true, data: chatRoom });
  } catch (err) {
    console.error('❌ showInterest error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

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

const cancelRequest = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (request.requesterId.toString() !== req.user.id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    request.status = 'CANCELLED';
    await request.save();
    res.status(200).json({ success: true, data: request, message: 'Request cancelled successfully' });
  } catch (err) {
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