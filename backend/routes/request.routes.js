const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createRequest,
  getPendingRequests,
  getMyRequests,
  getRequest,
  acceptRequest,
  rejectRequest,
  updateRequestStatus,
  cancelRequest,
  addFeedback
} = require('../controllers/request.controller');

// All routes are protected
router.use(protect);

// Create new request
router.post('/create', createRequest);

// Get requests
router.get('/pending', getPendingRequests);
router.get('/my-requests', getMyRequests);
router.get('/:id', getRequest);

// Owner actions
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);

// Status updates (both owner and requester)
router.put('/:id/status', updateRequestStatus);

// Requester actions
router.delete('/:id', cancelRequest);

// Feedback (after completion)
router.post('/:id/feedback', addFeedback);

module.exports = router;