const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const CommunityRequest = require('../models/CommunityRequest');
const { uploadImage } = require('../config/cloudinary');
const { createNotification } = require('../utils/notificationHelper');
const { getIO } = require('../config/socket');

/**
 * Get chat rooms for a user
 * GET /api/community/chat/rooms
 */
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      'participants.userId': req.user.id,
      isActive: true,
    })
      .populate('requestId')
      .populate('participants.userId', 'name email')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      data: chatRooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get chat room by request ID
 * GET /api/community/chat/room/:requestId
 */
exports.getChatRoomByRequest = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findOne({
      requestId: req.params.requestId,
      'participants.userId': req.user.id,
    })
      .populate('requestId')
      .populate('participants.userId', 'name email');

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    res.status(200).json({
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
 * Get messages for a chat room
 * GET /api/community/chat/:chatRoomId/messages
 */
exports.getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    const isParticipant = chatRoom.participants.some(
      (p) => p.userId.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await ChatMessage.find({ chatRoomId })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ chatRoomId });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
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
 * Send a text message
 * POST /api/community/chat/:chatRoomId/message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { content, type = 'text' } = req.body;

    // Verify chat room and user participation
    const chatRoom = await ChatRoom.findById(chatRoomId).populate(
      'participants.userId',
      'name email'
    );
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    const isParticipant = chatRoom.participants.some(
      (p) => p.userId._id.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Create message
    const message = await ChatMessage.create({
      chatRoomId,
      senderId: req.user.id,
      type,
      content,
    });

    await message.populate('senderId', 'name email');

    // Update chat room last message time
    chatRoom.lastMessageAt = new Date();
    await chatRoom.save();

    // Get recipient
    const recipient = chatRoom.participants.find(
      (p) => p.userId._id.toString() !== req.user.id
    );

    // Create notification
    await createNotification({
      userId: recipient.userId._id,
      type: 'NEW_MESSAGE',
      title: 'New message',
      message: `You have a new message in your chat`,
      relatedId: chatRoom._id,
      relatedType: 'ChatRoom',
    });

    // Emit socket event
    const io = getIO();
    io.to(chatRoomId).emit('newMessage', message);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Send an image message
 * POST /api/community/chat/:chatRoomId/image
 */
exports.sendImageMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

    // Verify chat room and user participation
    const chatRoom = await ChatRoom.findById(chatRoomId).populate(
      'participants.userId',
      'name email'
    );
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    const isParticipant = chatRoom.participants.some(
      (p) => p.userId._id.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Upload image
    const uploadResult = await uploadImage(req.file.buffer, 'chat-images');

    // Create message
    const message = await ChatMessage.create({
      chatRoomId,
      senderId: req.user.id,
      type: 'image',
      content: uploadResult.url,
    });

    await message.populate('senderId', 'name email');

    // Update chat room
    chatRoom.lastMessageAt = new Date();
    await chatRoom.save();

    // Get recipient
    const recipient = chatRoom.participants.find(
      (p) => p.userId._id.toString() !== req.user.id
    );

    // Create notification
    await createNotification({
      userId: recipient.userId._id,
      type: 'NEW_MESSAGE',
      title: 'New image',
      message: `You received an image in your chat`,
      relatedId: chatRoom._id,
      relatedType: 'ChatRoom',
    });

    // Emit socket event
    const io = getIO();
    io.to(chatRoomId).emit('newMessage', message);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lender confirms lending
 * POST /api/community/chat/:chatRoomId/confirm-lend
 */
exports.confirmLend = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const chatRoom = await ChatRoom.findById(chatRoomId).populate('requestId');
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    // Verify user is lender
    const lender = chatRoom.participants.find((p) => p.role === 'lender');
    if (lender.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only lender can confirm lending',
      });
    }

    // Update confirmation
    chatRoom.lenderConfirmed = true;
    await chatRoom.save();

    // Check if both confirmed
    if (chatRoom.lenderConfirmed && chatRoom.borrowerConfirmed) {
      // Update request status
      const request = await CommunityRequest.findById(chatRoom.requestId);
      request.status = 'CONFIRMED';
      request.acceptedBy = lender.userId;
      await request.save();

      // Close other chat rooms for this request
      await ChatRoom.updateMany(
        {
          requestId: chatRoom.requestId,
          _id: { $ne: chatRoom._id },
        },
        { isActive: false }
      );

      const borrower = chatRoom.participants.find((p) => p.role === 'requester');

      // Notify both participants
      await createNotification({
        userId: borrower.userId,
        type: 'LENDING_CONFIRMED',
        title: 'Lending confirmed!',
        message: `Your request for "${request.itemName}" has been confirmed`,
        relatedId: request._id,
        relatedType: 'CommunityRequest',
      });

      await createNotification({
        userId: lender.userId,
        type: 'LENDING_CONFIRMED',
        title: 'Lending confirmed!',
        message: `You have confirmed to lend "${request.itemName}"`,
        relatedId: request._id,
        relatedType: 'CommunityRequest',
      });

      // Emit socket event
      const io = getIO();
      io.to(chatRoomId).emit('lendingConfirmed', {
        requestId: request._id,
        status: 'CONFIRMED',
      });
    }

    res.status(200).json({
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
 * Borrower confirms borrowing
 * POST /api/community/chat/:chatRoomId/confirm-borrow
 */
exports.confirmBorrow = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const chatRoom = await ChatRoom.findById(chatRoomId).populate('requestId');
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    // Verify user is borrower
    const borrower = chatRoom.participants.find((p) => p.role === 'requester');
    if (borrower.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only borrower can confirm borrowing',
      });
    }

    // Update confirmation
    chatRoom.borrowerConfirmed = true;
    await chatRoom.save();

    // Check if both confirmed
    if (chatRoom.lenderConfirmed && chatRoom.borrowerConfirmed) {
      const lender = chatRoom.participants.find((p) => p.role === 'lender');
      
      // Update request status
      const request = await CommunityRequest.findById(chatRoom.requestId);
      request.status = 'CONFIRMED';
      request.acceptedBy = lender.userId;
      await request.save();

      // Close other chat rooms for this request
      await ChatRoom.updateMany(
        {
          requestId: chatRoom.requestId,
          _id: { $ne: chatRoom._id },
        },
        { isActive: false }
      );

      // Notify both participants
      await createNotification({
        userId: borrower.userId,
        type: 'LENDING_CONFIRMED',
        title: 'Lending confirmed!',
        message: `Your request for "${request.itemName}" has been confirmed`,
        relatedId: request._id,
        relatedType: 'CommunityRequest',
      });

      await createNotification({
        userId: lender.userId,
        type: 'LENDING_CONFIRMED',
        title: 'Lending confirmed!',
        message: `You have confirmed to lend "${request.itemName}"`,
        relatedId: request._id,
        relatedType: 'CommunityRequest',
      });

      // Emit socket event
      const io = getIO();
      io.to(chatRoomId).emit('lendingConfirmed', {
        requestId: request._id,
        status: 'CONFIRMED',
      });
    }

    res.status(200).json({
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