const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCommunityStats,
  getCommunityByLocality,
  getCommunityTrends,
  getCommunityByCategory
} = require('../controllers/communityController');

// Protect all routes with auth
router.use(protect);

/**
 * @route   GET /api/admin/community/stats
 * @desc    Get overall community sharing statistics
 * @access  Private/Admin
 */
router.get('/stats', getCommunityStats);

/**
 * @route   GET /api/admin/community/by-locality
 * @desc    Get community sharing stats broken down by locality
 * @access  Private/Admin
 */
router.get('/by-locality', getCommunityByLocality);

/**
 * @route   GET /api/admin/community/trends
 * @desc    Get community sharing trends over time
 * @access  Private/Admin
 */
router.get('/trends', getCommunityTrends);

/**
 * @route   GET /api/admin/community/by-category
 * @desc    Get community sharing stats by item category
 * @access  Private/Admin
 */
router.get('/by-category', getCommunityByCategory);

module.exports = router;
