const express = require('express');
const router = express.Router();
const {
  createRequest,
  getLocalityRequests,
  getMyRequests,
  getRequestById,
  showInterest,
  getActiveLendings,
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

// Show interest - creates chat room
router.post('/requests/:id/interest', showInterest);

// Cancel request
router.delete('/requests/:id', cancelRequest);

// DEBUG ENDPOINT - Remove in production
router.get('/debug/all-data', async (req, res) => {
  try {
    const User = require('../models/User');
    const CommunityRequest = require('../models/CommunityRequest');
    
    const users = await User.find().select('name email city locality location');
    const requests = await CommunityRequest.find().populate('requesterId', 'name email city');
    
    res.status(200).json({
      users,
      requests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
