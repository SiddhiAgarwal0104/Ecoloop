// controllers/chatController.js
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const CommunityRequest = require('../models/CommunityRequest');
const { uploadImage } = require('../config/cloudinary');
const { createNotification } = require('../utils/notificationHelper');
const { getIO } = require('../config/socket'); // ← single source of truth

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Emit an event to every socket in a chat room */
const emitToRoom = (roomId, event, payload) => {
  const io = getIO();
  if (io) io.to(roomId.toString()).emit(event, payload);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET CHAT ROOMS for the logged-in user
// GET /api/community/chat/rooms
// ─────────────────────────────────────────────────────────────────────────────
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      'participants.userId': req.user.id,
      isActive: true,
    })
      .populate('requestId', 'itemName status')
      .populate('participants.userId', 'name email')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, data: chatRooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET CHAT ROOM by its own _id
// GET /api/community/chat/room-by-id/:chatRoomId
// ─────────────────────────────────────────────────────────────────────────────
exports.getChatRoomById = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId)
      .populate('requestId', 'itemName status')
      .populate('participants.userId', 'name email');

    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    res.status(200).json({ success: true, data: chatRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET CHAT ROOM by requestId
// GET /api/community/chat/room/:requestId
// ─────────────────────────────────────────────────────────────────────────────
exports.getOrCreateChatRoomByRequest = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findOne({ requestId: req.params.requestId })
      .populate('requestId', 'itemName status')
      .populate('participants.userId', 'name email');

    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    res.status(200).json({ success: true, data: chatRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MESSAGES (paginated, oldest first)
// GET /api/community/chat/:chatRoomId/messages
// ─────────────────────────────────────────────────────────────────────────────
exports.getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(
      (p) => p.userId.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const skip = (page - 1) * limit;
    const messages = await ChatMessage.find({ chatRoomId })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ chatRoomId });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // oldest → newest
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND TEXT MESSAGE
// POST /api/community/chat/:chatRoomId/message
// ─────────────────────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const chatRoom = await ChatRoom.findById(chatRoomId).populate(
      'participants.userId',
      'name email'
    );
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(
      (p) => (p.userId._id || p.userId).toString() === req.user.id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await ChatMessage.create({
      chatRoomId,
      senderId: req.user.id,
      type,
      content: content.trim(),
    });
    await message.populate('senderId', 'name email');

    chatRoom.lastMessageAt = new Date();
    await chatRoom.save();

    // ── Real-time delivery ──────────────────────────────────────────
    emitToRoom(chatRoomId, 'newMessage', message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND IMAGE MESSAGE
// POST /api/community/chat/:chatRoomId/image
// ─────────────────────────────────────────────────────────────────────────────
exports.sendImageMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const chatRoom = await ChatRoom.findById(chatRoomId).populate(
      'participants.userId',
      'name email'
    );
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(
      (p) => (p.userId._id || p.userId).toString() === req.user.id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const uploadResult = await uploadImage(req.file.buffer, 'chat-images');

    const message = await ChatMessage.create({
      chatRoomId,
      senderId: req.user.id,
      type: 'image',
      content: uploadResult.url,
    });
    await message.populate('senderId', 'name email');

    chatRoom.lastMessageAt = new Date();
    await chatRoom.save();

    // Notify the other participant
    const recipient = chatRoom.participants.find(
      (p) => (p.userId._id || p.userId).toString() !== req.user.id.toString()
    );
    if (recipient) {
      await createNotification({
        userId: recipient.userId._id || recipient.userId,
        type: 'NEW_MESSAGE',
        title: 'New image',
        message: 'You received an image in your chat',
        relatedId: chatRoom._id,
        relatedType: 'ChatRoom',
      });
    }

    // ── Real-time delivery ──────────────────────────────────────────
    emitToRoom(chatRoomId, 'newMessage', message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: handle "both confirmed" logic
// ─────────────────────────────────────────────────────────────────────────────
const handleBothConfirmed = async (chatRoom) => {
  const lender = chatRoom.participants.find((p) => p.role === 'lender');
  const borrower = chatRoom.participants.find((p) => p.role === 'requester');

  const request = await CommunityRequest.findById(chatRoom.requestId);
  if (request) {
    request.status = 'CONFIRMED';
    request.acceptedBy = lender.userId;
    await request.save();
  }

  // Close all other chat rooms for this request
  await ChatRoom.updateMany(
    { requestId: chatRoom.requestId, _id: { $ne: chatRoom._id } },
    { isActive: false }
  );

  const notifPayload = {
    type: 'LENDING_CONFIRMED',
    title: 'Lending confirmed!',
    relatedId: request?._id,
    relatedType: 'CommunityRequest',
  };

  await createNotification({
    userId: borrower.userId,
    ...notifPayload,
    message: `Your request for "${request?.itemName}" has been confirmed`,
  });
  await createNotification({
    userId: lender.userId,
    ...notifPayload,
    message: `You confirmed to lend "${request?.itemName}"`,
  });

  emitToRoom(chatRoom._id, 'lendingConfirmed', {
    requestId: request?._id,
    status: 'CONFIRMED',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LENDER CONFIRMS LENDING
// POST /api/community/chat/:chatRoomId/confirm-lend
// ─────────────────────────────────────────────────────────────────────────────
exports.confirmLend = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId).populate('requestId');
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const lender = chatRoom.participants.find((p) => p.role === 'lender');
    if ((lender.userId._id || lender.userId).toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only lender can confirm lending' });
    }

    chatRoom.lenderConfirmed = true;
    await chatRoom.save();

    if (chatRoom.lenderConfirmed && chatRoom.borrowerConfirmed) {
      await handleBothConfirmed(chatRoom);
    }

    res.status(200).json({ success: true, data: chatRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BORROWER CONFIRMS BORROWING
// POST /api/community/chat/:chatRoomId/confirm-borrow
// ─────────────────────────────────────────────────────────────────────────────
exports.confirmBorrow = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId).populate('requestId');
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const borrower = chatRoom.participants.find((p) => p.role === 'requester');
    if ((borrower.userId._id || borrower.userId).toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only borrower can confirm' });
    }

    chatRoom.borrowerConfirmed = true;
    await chatRoom.save();

    if (chatRoom.lenderConfirmed && chatRoom.borrowerConfirmed) {
      await handleBothConfirmed(chatRoom);
    }

    res.status(200).json({ success: true, data: chatRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK HANDED OVER (lender)
// POST /api/community/chat/:chatRoomId/hand-over
// ─────────────────────────────────────────────────────────────────────────────
exports.markHandedOver = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const lender = chatRoom.participants.find((p) => p.role === 'lender');
    if ((lender.userId._id || lender.userId).toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only lender can mark as handed over' });
    }

    if (!chatRoom.lenderConfirmed || !chatRoom.borrowerConfirmed) {
      return res.status(400).json({ success: false, message: 'Both must confirm before handover' });
    }

    chatRoom.handedOver = true;
    await chatRoom.save();

    emitToRoom(chatRoom._id, 'itemHandedOver', { chatRoomId: chatRoom._id, handedOver: true });

    res.status(200).json({ success: true, data: chatRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK PICKED UP (borrower)
// POST /api/community/chat/:chatRoomId/picked-up
// ─────────────────────────────────────────────────────────────────────────────
exports.markPickedUp = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    const borrower = chatRoom.participants.find((p) => p.role === 'requester');
    if ((borrower.userId._id || borrower.userId).toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only borrower can mark as picked up' });
    }

    if (!chatRoom.handedOver) {
      return res.status(400).json({ success: false, message: 'Item must be handed over first' });
    }

    chatRoom.pickedUp = true;
    await chatRoom.save();

    emitToRoom(chatRoom._id, 'itemPickedUp', { chatRoomId: chatRoom._id, pickedUp: true });

    res.status(200).json({ success: true, data: chatRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};