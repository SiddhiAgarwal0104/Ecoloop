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

router.get('/household-requests', protect, getHouseholdDonations);
router.get('/household-requests/nearby', protect, getNearbyHouseholdDonations);
router.get('/household-requests/search', protect, searchHouseholdDonations);
router.get('/household-requests/:donationId', protect, getHouseholdDonationDetails);
router.get('/my-household-requests', protect, getMyHouseholdDonations);
router.post('/household-requests/:donationId/accept', protect, acceptHouseholdDonation);
router.patch('/household-requests/:donationId/status', protect, updateHouseholdDonationStatus);

module.exports = router;
