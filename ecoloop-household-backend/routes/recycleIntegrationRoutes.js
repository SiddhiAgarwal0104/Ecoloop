const express = require('express');
const router = express.Router();
const {
  getAvailableRecycles,
  acceptRecycle,
  getMyRecycleRequests,
  getRecycleDetails,
  updateRecycleStatus,
  getRecyclerStats,
  testNotification,
  testDBNotification,
  getSocketStatus
} = require('../controllers/recycleIntegrationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Household Recycle Integration Routes
 * Bridges household recycle requests with recycler operations
 */

// Protected routes - Authentication required (Recycler only)
router.use(protect);
router.use(restrictTo('RECYCLER'));

// Get available recycles filtered by recycler location
router.get('/available', getAvailableRecycles);

// Get available recycles filtered by recycler location
router.get('/available', getAvailableRecycles);

// Recycler routes - Specific routes BEFORE parameterized routes
router.get('/stats/all', getRecyclerStats);
router.get('/test-notification', testNotification);
router.post('/test-db-notification', testDBNotification);
router.get('/socket-status', getSocketStatus);
router.get('/my-requests', getMyRecycleRequests);
router.post('/:recycleId/accept', acceptRecycle);
router.patch('/:recycleId/status', updateRecycleStatus);
router.get('/:recycleId', getRecycleDetails);

module.exports = router;
