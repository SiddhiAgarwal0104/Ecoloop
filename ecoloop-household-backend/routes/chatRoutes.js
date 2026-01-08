const express = require('express');
const router = express.Router();

const {
  getChatRooms,
  getChatRoomById,        // ✅ MISSING IMPORT ADDED
  getOrCreateChatRoomByRequest,
  getChatMessages,
  sendMessage,
  sendImageMessage,
  confirmLend,
  confirmBorrow,
  markHandedOver,
  markPickedUp,
} = require('../controllers/chatController');

const { protect } = require('../middleware/authMiddleware'); // ✅ correct middleware
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Chat room routes
router.get('/rooms', getChatRooms);
router.get('/room/:requestId', getOrCreateChatRoomByRequest);
router.get('/room-by-id/:chatRoomId', getChatRoomById);

// Message routes
router.get('/:chatRoomId/messages', getChatMessages);
router.post('/:chatRoomId/message', sendMessage);
router.post('/:chatRoomId/image', upload.single('image'), sendImageMessage);

// Confirmation routes
router.post('/:chatRoomId/confirm-lend', confirmLend);
router.post('/:chatRoomId/confirm-borrow', confirmBorrow);

// Hand over and pickup routes
router.post('/:chatRoomId/hand-over', markHandedOver);
router.post('/:chatRoomId/picked-up', markPickedUp);

module.exports = router;
