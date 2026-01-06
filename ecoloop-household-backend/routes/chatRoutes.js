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
} = require('../controllers/chatController');

const { protect } = require('../middleware/authMiddleware'); // ✅ correct middleware
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Chat room routes
router.get('/chat/rooms', getChatRooms);
//router.get('/chat/room/:requestId', getOrCreateChatRoomByRequest);
router.get('/chat/room/:requestId', getOrCreateChatRoomByRequest);
router.get('/chat/room-by-id/:chatRoomId', getChatRoomById);

// Message routes
router.get('/chat/:chatRoomId/messages', getChatMessages);
router.post('/chat/:chatRoomId/message', sendMessage);
router.post('/chat/:chatRoomId/image', upload.single('image'), sendImageMessage);

// Confirmation routes
router.post('/chat/:chatRoomId/confirm-lend', confirmLend);
router.post('/chat/:chatRoomId/confirm-borrow', confirmBorrow);

module.exports = router;
