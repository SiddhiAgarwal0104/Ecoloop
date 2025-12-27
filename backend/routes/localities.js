const express = require('express');
const router = express.Router();
const {
  getAllLocalities,
  getLocalityById,
  getLocalityStats,
  getLocalitiesByPerformance,
  searchLocalities
} = require('../controllers/localitiesController');

const { protect } = require('../middleware/auth');
const { apiRateLimiter, validateDateRange } = require('../middleware/adminAuth');

// Apply authentication and rate limiting
router.use(protect);
router.use(apiRateLimiter);

// Search
router.get('/search', searchLocalities);

// Performance categories
router.get('/performance/:category', getLocalitiesByPerformance);

// Specific locality
router.get('/:id', getLocalityById);
router.get('/:id/stats', validateDateRange, getLocalityStats);

// List all localities
router.get('/', getAllLocalities);

module.exports = router;