const express = require('express');
const router = express.Router();
const {
  getImpactMetrics,
  getImpactTrends,
  getImpactByWasteType,
  getImpactByLocality,
  getMonthlySummary
} = require('../controllers/sustainabilityController');

const { generateMonthlyInsights } = require('../services/aiInsightsService');
const { protect } = require('../middleware/auth');
const { apiRateLimiter, validateDateRange } = require('../middleware/adminAuth');

// Apply authentication and rate limiting
router.use(protect);
router.use(apiRateLimiter);

// Impact Metrics
router.get('/impact', validateDateRange, getImpactMetrics);
router.get('/trends', getImpactTrends);
router.get('/by-waste-type', validateDateRange, getImpactByWasteType);
router.get('/by-locality', validateDateRange, getImpactByLocality);
router.get('/monthly-summary', getMonthlySummary);

// AI-Powered Insights (integrated in admin dashboard)
router.get('/ai-insights', async (req, res) => {
  try {
    const insights = await generateMonthlyInsights();
    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI Insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI insights',
      error: error.message
    });
  }
});

module.exports = router;