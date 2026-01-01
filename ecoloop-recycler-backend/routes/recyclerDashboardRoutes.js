const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getPerformanceMetrics,
  getStatistics
} = require('../controllers/recyclerDashboardController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Dashboard & Analytics Routes for Recycler Module
 * All routes require authentication
 */

// ====== Protected Routes (Authentication Required) ======
// Apply authentication middleware to all routes
router.use(protect);

/**
 * Get recycler dashboard data
 * @route GET /api/recycler/dashboard
 * @access Private
 * @returns {Object} Dashboard stats, profile, and recent requests
 */
router.get('/', getDashboard);

/**
 * Get performance metrics for recycler
 * @route GET /api/recycler/dashboard/performance
 * @access Private
 * @query {string} period - Time period (week, month, year, all - default: month)
 * @returns {Object} Performance data including completion rate, waste collected, ratings
 */
router.get('/performance', getPerformanceMetrics);

/**
 * Get detailed statistics
 * @route GET /api/recycler/dashboard/statistics
 * @access Private
 * @returns {Object} Waste by category, requests by month, status distribution
 */
router.get('/statistics', getStatistics);

module.exports = router;
