// routes/chatbotRoutes.js
// Defines /api/chatbot/message endpoint for AI Waste Coach

const express = require('express');
const router = express.Router();

const { handleMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/chatbot/message (supports optional image upload)
router.post('/message', protect, upload.single('image'), handleMessage);

module.exports = router;