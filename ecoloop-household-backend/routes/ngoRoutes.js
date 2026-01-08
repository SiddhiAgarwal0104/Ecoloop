const express = require('express');
const router = express.Router();
const {
  getAvailableDonations,
  getDonationDetails,
  acceptDonation,
  getAcceptedDonations,
  updateDonationStatus,
  getAllVerifiedNGOs,
} = require('../controllers/ngoController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// ============ PUBLIC ROUTES (NO AUTH REQUIRED) ============

// Get all verified NGOs (public listing)
router.get('/', getAllVerifiedNGOs);

// ============ PROTECTED ROUTES (NGO ONLY) ============

// Apply authentication and NGO restriction to protected routes
router.use(protect);
router.use(restrictTo('NGO'));

// Available donations (for NGO to browse)
router.get('/donations/available', getAvailableDonations);

// Accepted donations (NGO's own accepted donations)
router.get('/donations/accepted', getAcceptedDonations);

// Get specific donation details
router.get('/donations/:id', getDonationDetails);

// Accept a donation
router.post('/donations/:id/accept', acceptDonation);

// Update donation status (picked up / completed)
router.put('/donations/:id/status', updateDonationStatus);

module.exports = router;