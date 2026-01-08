const ChatRoom = require('../models/ChatRoom');
const { getIO } = require('../config/socket');

/**
 * Mark item as handed over by lender
 * POST /api/chat/:chatRoomId/hand-over
 */
exports.markHandedOver = async (req, res) => {
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
    const lenderId = lender.userId._id || lender.userId;
    if (lenderId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only lender can mark as handed over',
      });
    }

    // Check if both are confirmed first
    if (!chatRoom.lenderConfirmed || !chatRoom.borrowerConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Both parties must confirm before handing over',
      });
    }

    chatRoom.handedOver = true;
    await chatRoom.save();

    // Emit socket event if available
    const io = getIO();
    if (io) {
      io.to(chatRoomId).emit('itemHandedOver', {
        chatRoomId,
        handedOver: true,
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
 * Mark item as picked up by borrower
 * POST /api/chat/:chatRoomId/picked-up
 */
exports.markPickedUp = async (req, res) => {
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
    const borrowerId = borrower.userId._id || borrower.userId;
    if (borrowerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only borrower can mark as picked up',
      });
    }

    // Check if item has been handed over
    if (!chatRoom.handedOver) {
      return res.status(400).json({
        success: false,
        message: 'Item must be handed over first',
      });
    }

    chatRoom.pickedUp = true;
    await chatRoom.save();

    // Emit socket event if available
    const io = getIO();
    if (io) {
      io.to(chatRoomId).emit('itemPickedUp', {
        chatRoomId,
        pickedUp: true,
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
