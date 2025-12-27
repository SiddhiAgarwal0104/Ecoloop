const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getWasteTrends,
  getWasteDistribution,
  getTopLocalities,
  getLowPerformingLocalities,
  getPlatformStats
} = require('../controllers/analyticsController');

const { protect } = require('../middleware/auth');
const { apiRateLimiter, validateDateRange } = require('../middleware/adminAuth');

// Apply authentication and rate limiting to all routes
router.use(protect);
router.use(apiRateLimiter);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Waste Analytics
router.get('/waste-trends', validateDateRange, getWasteTrends);
router.get('/waste-distribution', validateDateRange, getWasteDistribution);

// Locality Analytics
router.get('/top-localities', getTopLocalities);
router.get('/low-localities', getLowPerformingLocalities);

// Platform Stats
router.get('/platform-stats', validateDateRange, getPlatformStats);

module.exports = router;