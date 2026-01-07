const express = require('express');
const router = express.Router();
const {
  getHouseholdDashboard,
  getHouseholdStats
} = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Apply authentication and role restriction to all routes
router.use(protect);
router.use(restrictTo('HOUSEHOLD'));

// Dashboard routes
router.get('/household', getHouseholdDashboard);
router.get('/stats', getHouseholdStats);

module.exports = router;