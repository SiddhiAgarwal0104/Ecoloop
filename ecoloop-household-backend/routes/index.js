const express = require('express');
const router = express.Router();

/**
 * MAIN ROUTES INDEX
 * Central routing configuration for the application
 * Organizes all module routes by functionality
 */

// ====================================================================
// AUTHENTICATION & USER MANAGEMENT
// ====================================================================

// General authentication (households, users)
router.use('/auth', require('./authRoutes'));

// ====================================================================
// HOUSEHOLD MODULE
// ====================================================================

// Dashboard & analytics
router.use('/dashboard', require('./dashboardRoutes'));

// Donation management
router.use('/donations', require('./donationRoutes'));

// Recycle requests
router.use('/recycles', require('./recycleRoutes'));

// Notifications (household)
router.use('/notifications', require('./notificationRoutes'));

// Rewards & points
router.use('/rewards', require('./rewardsRoutes'));

// Badges & achievements
router.use('/badges', require('./badgeRoutes'));

// Leaderboards
router.use('/leaderboard', require('./leaderboardRoutes'));

// AI Waste Coach chatbot
router.use('/chatbot', require('./chatbotRoutes'));

// ====================================================================
// NGO MODULE
// ====================================================================

// NGO operations (donation management)
router.use('/ngo', require('./ngoRoutes'));

// ====================================================================
// RECYCLER MODULE (Consolidated)
// ====================================================================

// All recycler functionality (auth, dashboard, requests, integration)
router.use('/recycler', require('./recyclerRoutes'));

// Recycler notifications (separate from household notifications)
router.use('/recycler/notifications', require('./recyclerNotificationRoutes'));

// ====================================================================
// INTEGRATION ROUTES
// ====================================================================

// NGO-Household donation integration
router.use('/integration', require('./integrationRoutes'));

// ====================================================================
// HEALTH CHECK
// ====================================================================

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api
 * @desc    API info endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Waste Management API',
    version: '1.0.0',
    modules: {
      household: '/api/dashboard, /api/donations, /api/recycles, /api/notifications',
      ngo: '/api/ngo',
      recycler: '/api/recycler',
      integration: '/api/integration',
      common: '/api/auth, /api/rewards, /api/badges, /api/leaderboard, /api/chatbot'
    }
  });
});

module.exports = router;