const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getHouseholdDonations,
  getNearbyHouseholdDonations,
  acceptHouseholdDonation,
  updateHouseholdDonationStatus,
  getMyHouseholdDonations,
  getHouseholdDonationDetails,
  searchHouseholdDonations
} = require('../controllers/donationIntegrationController');

/**
 * NGO-Household Donation Integration Routes
 * Base path: /api/integration
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /api/integration/household-requests/search
 * @desc    Search household donation requests
 * @access  Private
 * @query   {string} category, status, location
 */
router.get('/household-requests/search', searchHouseholdDonations);

/**
 * @route   GET /api/integration/household-requests/nearby
 * @desc    Get nearby household donation requests
 * @access  Private
 * @query   {number} latitude, longitude, radius
 */
router.get('/household-requests/nearby', getNearbyHouseholdDonations);

/**
 * @route   GET /api/integration/my-household-requests
 * @desc    Get NGO's accepted household donation requests
 * @access  Private (NGO)
 */
router.get('/my-household-requests', getMyHouseholdDonations);

/**
 * @route   GET /api/integration/household-requests/:donationId
 * @desc    Get household donation details
 * @access  Private
 */
router.get('/household-requests/:donationId', getHouseholdDonationDetails);

/**
 * @route   GET /api/integration/household-requests
 * @desc    Get all household donation requests
 * @access  Private
 */
router.get('/household-requests', getHouseholdDonations);

/**
 * @route   POST /api/integration/household-requests/:donationId/accept
 * @desc    Accept a household donation request
 * @access  Private (NGO)
 */
router.post('/household-requests/:donationId/accept', acceptHouseholdDonation);

/**
 * @route   PATCH /api/integration/household-requests/:donationId/status
 * @desc    Update household donation status
 * @access  Private (NGO)
 */
router.patch('/household-requests/:donationId/status', updateHouseholdDonationStatus);

module.exports = router;