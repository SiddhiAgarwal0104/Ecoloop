const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Import controllers
const authController = require('../controllers/recyclerAuthController');
const dashboardController = require('../controllers/recyclerDashboardController');
const requestController = require('../controllers/recyclerRequestController');
const integrationController = require('../controllers/recycleIntegrationController');

/**
 * RECYCLER MODULE - Consolidated Routes
 * Base path: /api/recycler
 */

// ====================================================================
// PUBLIC ROUTES (No Authentication Required)
// ====================================================================

/**
 * @route   POST /api/recycler/auth/register
 * @desc    Register new recycler
 * @access  Public
 */
router.post('/auth/register', authController.register);

/**
 * @route   POST /api/recycler/auth/login
 * @desc    Login recycler
 * @access  Public
 */
router.post('/auth/login', authController.login);

/**
 * @route   GET /api/recycler/requests/available
 * @desc    Get all available recycle requests
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 */
router.get('/requests/available', requestController.getAvailableRequests);

/**
 * @route   GET /api/recycler/requests/nearby
 * @desc    Get requests nearby recycler's location
 * @access  Public
 * @query   {number} latitude - Recycler latitude (required)
 * @query   {number} longitude - Recycler longitude (required)
 * @query   {number} radius - Search radius in km (default: 5)
 */
router.get('/requests/nearby', requestController.getNearbyRequests);

// ====================================================================
// PROTECTED ROUTES (Authentication + RECYCLER Role Required)
// ====================================================================

// Apply authentication and role restriction to all routes below
router.use(protect);
router.use(restrictTo('RECYCLER'));

// --------------------------------------------------------------------
// AUTH & PROFILE ROUTES
// --------------------------------------------------------------------

/**
 * @route   GET /api/recycler/auth/profile
 * @desc    Get current recycler profile
 * @access  Private (RECYCLER)
 */
router.get('/auth/profile', authController.getProfile);

/**
 * @route   PUT /api/recycler/auth/profile
 * @desc    Update recycler profile
 * @access  Private (RECYCLER)
 * @body    {string} name, phone, address, latitude, longitude, bio
 * @file    {File} profileImage - Profile image (optional)
 */
router.put('/auth/profile', upload.single('profileImage'), authController.updateProfile);

/**
 * @route   PUT /api/recycler/auth/change-password
 * @desc    Change password
 * @access  Private (RECYCLER)
 */
router.put('/auth/change-password', authController.changePassword);

/**
 * @route   POST /api/recycler/auth/logout
 * @desc    Logout recycler
 * @access  Private (RECYCLER)
 */
router.post('/auth/logout', authController.logout);

// --------------------------------------------------------------------
// DASHBOARD & ANALYTICS ROUTES
// --------------------------------------------------------------------

/**
 * @route   GET /api/recycler/dashboard
 * @desc    Get recycler dashboard data
 * @access  Private (RECYCLER)
 */
router.get('/dashboard', dashboardController.getDashboard);

/**
 * @route   GET /api/recycler/dashboard/performance
 * @desc    Get performance metrics
 * @access  Private (RECYCLER)
 * @query   {string} period - week, month, year, all (default: month)
 */
router.get('/dashboard/performance', dashboardController.getPerformanceMetrics);

/**
 * @route   GET /api/recycler/dashboard/statistics
 * @desc    Get detailed statistics
 * @access  Private (RECYCLER)
 */
router.get('/dashboard/statistics', dashboardController.getStatistics);

/**
 * @route   GET /api/recycler/dashboard/stats
 * @desc    Get recycler stats (alias for statistics)
 * @access  Private (RECYCLER)
 */
router.get('/dashboard/stats', integrationController.getRecyclerStats);

// --------------------------------------------------------------------
// REQUEST MANAGEMENT ROUTES
// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// --------------------------------------------------------------------

/**
 * @route   GET /api/recycler/requests/my-requests
 * @desc    Get recycler's accepted requests
 * @access  Private (RECYCLER)
 * @query   {string} status - Filter by status (ACCEPTED, PICKED_UP, RECYCLED)
 */
router.get('/requests/my-requests', requestController.getMyRequests);

/**
 * @route   POST /api/recycler/requests/:requestId/accept
 * @desc    Accept a recycle request
 * @access  Private (RECYCLER)
 */
router.post('/requests/:requestId/accept', requestController.acceptRequest);

/**
 * @route   PUT /api/recycler/requests/:id/status
 * @desc    Update request status
 * @access  Private (RECYCLER)
 * @body    {string} status - PICKED_UP or RECYCLED
 */
router.put('/requests/:id/status', requestController.updateRequestStatus);

/**
 * @route   GET /api/recycler/requests/:id
 * @desc    Get request details
 * @access  Private (RECYCLER)
 */
router.get('/requests/:id', requestController.getRequestDetails);

// --------------------------------------------------------------------
// INTEGRATION ROUTES (Household Recycle Requests)
// --------------------------------------------------------------------

/**
 * @route   GET /api/recycler/integration/available
 * @desc    Get available household recycles filtered by recycler location
 * @access  Private (RECYCLER)
 */
router.get('/integration/available', integrationController.getAvailableRecycles);

/**
 * @route   GET /api/recycler/integration/my-requests
 * @desc    Get recycler's accepted household recycle requests
 * @access  Private (RECYCLER)
 */
router.get('/integration/my-requests', integrationController.getMyRecycleRequests);

/**
 * @route   POST /api/recycler/integration/:recycleId/accept
 * @desc    Accept a household recycle request
 * @access  Private (RECYCLER)
 */
router.post('/integration/:recycleId/accept', integrationController.acceptRecycle);

/**
 * @route   PATCH /api/recycler/integration/:recycleId/status
 * @desc    Update household recycle status
 * @access  Private (RECYCLER)
 */
router.patch('/integration/:recycleId/status', integrationController.updateRecycleStatus);

/**
 * @route   GET /api/recycler/integration/:recycleId
 * @desc    Get household recycle details
 * @access  Private (RECYCLER)
 */
router.get('/integration/:recycleId', integrationController.getRecycleDetails);

// --------------------------------------------------------------------
// TESTING & DEBUGGING ROUTES (Remove in production)
// --------------------------------------------------------------------

/**
 * @route   GET /api/recycler/test/notification
 * @desc    Test notification system
 * @access  Private (RECYCLER)
 */
router.get('/test/notification', integrationController.testNotification);

/**
 * @route   POST /api/recycler/test/db-notification
 * @desc    Test database notification
 * @access  Private (RECYCLER)
 */
router.post('/test/db-notification', integrationController.testDBNotification);

/**
 * @route   GET /api/recycler/test/socket-status
 * @desc    Get socket connection status
 * @access  Private (RECYCLER)
 */
router.get('/test/socket-status', integrationController.getSocketStatus);

module.exports = router;