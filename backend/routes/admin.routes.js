const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getAnalytics } = require('../controllers/admin.controller');

router.use(protect);
router.get('/analytics', authorize('admin'), getAnalytics);

module.exports = router;