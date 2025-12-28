const express = require('express');
const router = express.Router();
const {
  createRequest,
  getLocalityRequests,
  getMyRequests,
  getRequestById,
  showInterest,
  getActiveLendings,
  markHandedOver,
  markReturned,
  cancelRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Create request with image upload
router.post('/requests', upload.array('images', 3), createRequest);

// Get requests - specific routes must come before :id route
router.get('/requests/my-requests', getMyRequests);
router.get('/requests/active-lendings', getActiveLendings);
router.get('/requests', getLocalityRequests);
router.get('/requests/:id', getRequestById);

// Show interest
router.post('/requests/:id/interest', showInterest);

// Lending actions
router.put('/requests/:id/handover', markHandedOver);
router.put('/requests/:id/return', markReturned);

// Cancel request
router.delete('/requests/:id', cancelRequest);

module.exports = router;