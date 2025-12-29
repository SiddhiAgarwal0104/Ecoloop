const CommunityRequest = require('../models/CommunityRequest');
const ChatRoom = require('../models/ChatRoom');

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
      paymentType,
      amount,
    } = req.body;

    const request = await CommunityRequest.create({
      itemName,
      category,
      description,
      requesterId: req.user.id,

      city: req.user.city.toLowerCase().trim(),
      locality: req.user.locality.toLowerCase().trim(),
      pincode: req.user.pincode.toString().trim(),


      startDate,
      endDate,
      paymentType,
      amount: paymentType === 'Paid' ? amount : 0,
      status: 'OPEN',
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET COMMUNITY REQUESTS (same locality)
 */
const getLocalityRequests = async (req, res) => {
  try {
    const city = req.user.city.toLowerCase().trim();

    const query = {
      city,
      requesterId: { $ne: req.user.id },
      status: { $in: ['OPEN', 'NEGOTIATING'] },
    };

    const requests = await CommunityRequest.find(query)
      .populate('requesterId', 'name email')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (err) {
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
    const request = await CommunityRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.requesterId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot interest own request' });
    }

    if (!['OPEN', 'NEGOTIATING'].includes(request.status)) {
      return res.status(400).json({ success: false, message: 'Request not available' });
    }

    const existingChat = await ChatRoom.findOne({
      requestId: request._id,
      'participants.userId': req.user.id,
    });

    if (existingChat) {
      return res.status(200).json({ success: true, data: existingChat });
    }

    const chatRoom = await ChatRoom.create({
      requestId: request._id,
      participants: [
        { userId: request.requesterId, role: 'requester' },
        { userId: req.user.id, role: 'lender' },
      ],
    });

    request.status = 'NEGOTIATING';
    await request.save();

    res.status(201).json({ success: true, data: chatRoom });
  } catch (err) {
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
    });

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
    const request = await CommunityRequest.findById(req.params.id);

    if (!request || request.requesterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'CANCELLED';
    await request.save();

    res.status(200).json({ success: true });
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
