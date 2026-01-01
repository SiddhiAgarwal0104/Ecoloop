const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getGlobalLeaderboard,
  getLocalityLeaderboard,
  getMyStats
} = require('../controllers/leaderboardController');

// All routes require authentication
router.use(protect);

// @route   GET /api/leaderboard/global
router.get('/global', getGlobalLeaderboard);

// @route   GET /api/leaderboard/locality
router.get('/locality', getLocalityLeaderboard);

// @route   GET /api/leaderboard/my-stats
router.get('/my-stats', getMyStats);

module.exports = router;