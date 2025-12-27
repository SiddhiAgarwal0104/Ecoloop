const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  logWaste,
  getMyLogs,
  getWasteLog,
  updateWasteLog,
  deleteWasteLog,
  getDashboard,
  predictWaste
} = require('../controllers/waste.controller');

// All routes protected
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboard);

// Waste logging
router.post('/log', authorize('household'), upload.single('image'), logWaste);
// Backwards-compatible alias for frontend: /api/waste/history -> returns user's logs
router.get('/my-logs', getMyLogs);
router.get('/history', getMyLogs);
router.get('/log/:id', getWasteLog);
router.put('/log/:id', authorize('household'), updateWasteLog);
router.delete('/log/:id', authorize('household'), deleteWasteLog);

// AI prediction
router.post('/predict', authorize('household'), upload.single('image'), predictWaste);

module.exports = router;
