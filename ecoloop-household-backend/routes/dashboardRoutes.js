const express = require('express');
const router = express.Router();
const {
  getHouseholdDashboard,
  getHouseholdStats,
  getNGODashboard,
  getRecyclerDashboard
} = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// ============ PROTECTED ROUTES ============
router.use(protect);

// ============ HOUSEHOLD DASHBOARD ============
router.get('/household', restrictTo('HOUSEHOLD'), getHouseholdDashboard);
router.get('/household/stats', restrictTo('HOUSEHOLD'), getHouseholdStats);

// ============ NGO DASHBOARD ============
router.get('/ngo', restrictTo('NGO'), getNGODashboard);

// ============ RECYCLER DASHBOARD ============
router.get('/recycler', restrictTo('RECYCLER'), getRecyclerDashboard);

module.exports = router;