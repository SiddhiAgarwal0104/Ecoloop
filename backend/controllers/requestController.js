const CommunityRequest = require('../models/CommunityRequest');
const ChatRoom = require('../models/ChatRoom');
const { uploadImage } = require('../config/cloudinary');
const { createNotification } = require('../utils/notificationHelper');
const { getIO } = require('../config/socket');

/**
 * Create a new community request
 * POST /api/community/requests
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      itemName,
      category,
      description,
      locality,
      pincode,
      startDate,
      endDate,
      paymentType,
      amount,
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({
        message: 'End date must be after start date',
      });
    }

    // Upload images if provided
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadImage(file.buffer, 'community-requests')
      );
      images = await Promise.all(uploadPromises);
    }

    // Create request
    const request = await CommunityRequest.create({
      itemName,
      category,
      description,
      images,
      requesterId: req.user.id,
      locality,
      pincode,
      startDate: start,
      endDate: end,
      paymentType,
      amount: paymentType === 'Paid' ? amount : 0,
      status: 'OPEN',
    });

    // Populate requester details
    await request.populate('requesterId', 'name email');

    // Create notifications for users in same locality
    const io = getIO();
    io.to(`locality:${locality}:${pincode}`).emit('newRequest', {
      requestId: request._id,
      itemName: request.itemName,
      locality: request.locality,
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all requests in user's locality
 * GET /api/community/requests
 */
exports.getLocalityRequests = async (req, res) => {
  try {
    const { locality, pincode } = req.user;
    const { status, category, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {
      locality,
      pincode,
      requesterId: { $ne: req.user.id }, // Exclude own requests
    };

    if (status) query.status = status;
    if (category) query.category = category;

    // Pagination
    const skip = (page - 1) * limit;

    const requests = await CommunityRequest.find(query)
      .populate('requesterId', 'name email')
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user's own requests
 * GET /api/community/requests/my-requests
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await CommunityRequest.find({
      requesterId: req.user.id,
    })
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single request details
 * GET /api/community/requests/:id
 */
exports.getRequestById = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id)
      .populate('requesterId', 'name email')
      .populate('acceptedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Show interest in a request (creates chat room)
 * POST /api/community/requests/:id/interest
 */
exports.showInterest = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check if user is trying to show interest in own request
    if (request.requesterId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot show interest in your own request',
      });
    }

    // Check if request is still open or negotiating
    if (!['OPEN', 'NEGOTIATING'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'This request is no longer available',
      });
    }

    // Check if chat room already exists
    const existingChatRoom = await ChatRoom.findOne({
      requestId: request._id,
      'participants.userId': { $all: [req.user.id, request.requesterId] },
    });

    if (existingChatRoom) {
      return res.status(200).json({
        success: true,
        message: 'Chat room already exists',
        data: existingChatRoom,
      });
    }

    // Create chat room
    const chatRoom = await ChatRoom.create({
      requestId: request._id,
      participants: [
        { userId: request.requesterId, role: 'requester' },
        { userId: req.user.id, role: 'lender' },
      ],
    });

    // Update request status to NEGOTIATING
    request.status = 'NEGOTIATING';
    await request.save();

    // Create notification for requester
    await createNotification({
      userId: request.requesterId,
      type: 'INTEREST_SHOWN',
      title: 'Someone is interested!',
      message: `A user has shown interest in your request for "${request.itemName}"`,
      relatedId: request._id,
      relatedType: 'CommunityRequest',
    });

    // Emit socket event
    const io = getIO();
    io.to(request.requesterId.toString()).emit('interestShown', {
      requestId: request._id,
      chatRoomId: chatRoom._id,
    });

    res.status(201).json({
      success: true,
      data: chatRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get active lendings (where user is lender)
 * GET /api/community/requests/active-lendings
 */
exports.getActiveLendings = async (req, res) => {
  try {
    const lendings = await CommunityRequest.find({
      acceptedBy: req.user.id,
      status: { $in: ['CONFIRMED', 'ACTIVE'] },
    })
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: lendings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark item as handed over
 * PUT /api/community/requests/:id/handover
 */
exports.markHandedOver = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify user is the lender
    if (request.acceptedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (request.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Request must be in CONFIRMED status',
      });
    }

    request.status = 'ACTIVE';
    request.handedOverAt = new Date();
    await request.save();

    // Create notification
    await createNotification({
      userId: request.requesterId,
      type: 'LENDING_CONFIRMED',
      title: 'Item handed over',
      message: `The item "${request.itemName}" has been handed over to you`,
      relatedId: request._id,
      relatedType: 'CommunityRequest',
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark item as returned
 * PUT /api/community/requests/:id/return
 */
exports.markReturned = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify user is the lender
    if (request.acceptedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (request.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Request must be in ACTIVE status',
      });
    }

    request.status = 'COMPLETED';
    request.returnedAt = new Date();
    await request.save();

    // Create notification
    await createNotification({
      userId: request.requesterId,
      type: 'LENDING_COMPLETED',
      title: 'Lending completed',
      message: `The lending for "${request.itemName}" has been marked as completed`,
      relatedId: request._id,
      relatedType: 'CommunityRequest',
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cancel a request
 * DELETE /api/community/requests/:id
 */
exports.cancelRequest = async (req, res) => {
  try {
    const request = await CommunityRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Only requester can cancel
    if (request.requesterId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Can only cancel OPEN or NEGOTIATING requests
    if (!['OPEN', 'NEGOTIATING'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this request',
      });
    }

    request.status = 'CANCELLED';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};