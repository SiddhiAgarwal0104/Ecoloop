const express = require('express');
const router = express.Router();
const {
  generateCSVReport,
  generatePDFReport,
  getReportTypes
} = require('../controllers/reportsController');

const { protect } = require('../middleware/auth');
const { apiRateLimiter, validateDateRange, logAdminAction } = require('../middleware/adminAuth');

// Apply authentication and rate limiting
router.use(protect);
router.use(apiRateLimiter);
router.use(logAdminAction); // Log report generation for audit

// Get available report types
router.get('/types', getReportTypes);

// Generate reports
router.get('/csv', validateDateRange, generateCSVReport);
router.get('/pdf', validateDateRange, generatePDFReport);

module.exports = router;