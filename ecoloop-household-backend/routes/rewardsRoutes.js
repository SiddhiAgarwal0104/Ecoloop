const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRewardsSummary } = require('../controllers/rewardsController');

// All routes require authentication
router.use(protect);

// @route   GET /api/rewards/summary
router.get('/summary', getRewardsSummary);

module.exports = router;