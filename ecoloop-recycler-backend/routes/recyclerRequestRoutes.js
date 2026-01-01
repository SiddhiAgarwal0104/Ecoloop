const express = require('express');
const router = express.Router();
const {
  getAvailableRequests,
  getNearbyRequests,
  acceptRequest,
  getMyRequests,
  updateRequestStatus,
  getRequestDetails
} = require('../controllers/recyclerRequestController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Request Management Routes for Recycler Module
 * All request operations require authentication
 */

// ====== Public/Discovery Routes (No Auth Required) ======
/**
 * Get all available recycle requests
 * @route GET /api/recycler/requests/available
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10)
 */
router.get('/available', getAvailableRequests);

/**
 * Get requests nearby recycler's location
 * @route GET /api/recycler/requests/nearby
 * @query {number} latitude - Recycler latitude (required)
 * @query {number} longitude - Recycler longitude (required)
 * @query {number} radius - Search radius in km (default: 5)
 */
router.get('/nearby', getNearbyRequests);

// ====== Protected Routes (Authentication Required) ======
// All routes below require valid JWT token
router.use(protect);

/**
 * Accept a recycle request
 * @route POST /api/recycler/requests/:requestId/accept
 * @access Private
 * @param {string} requestId - Request ID to accept
 */
router.post('/:requestId/accept', acceptRequest);

/**
 * Get recycler's accepted requests
 * @route GET /api/recycler/requests/my-requests
 * @access Private
 * @query {string} status - Filter by status (ACCEPTED, PICKED_UP, RECYCLED)
 */
router.get('/my-requests', getMyRequests);

/**
 * Update request status
 * @route PUT /api/recycler/requests/:id/status
 * @access Private
 * @param {string} id - Request acceptance ID
 * @body {string} status - New status (PICKED_UP, RECYCLED)
 */
router.put('/:id/status', updateRequestStatus);

/**
 * Get request details
 * @route GET /api/recycler/requests/:id
 * @access Private
 * @param {string} id - Request acceptance ID
 */
router.get('/:id', getRequestDetails);

module.exports = router;
