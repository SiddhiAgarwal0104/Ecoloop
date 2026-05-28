const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { connectDB } = require('./config/db');
const AppError = require('./utils/appError');
const { initSocket } = require('./utils/socketService');
const ngoRoutes = require('./routes/ngoRoutes');

/**
 * EcoLoop Recycler Backend - Main Server File
 * Handles routing, middleware, error handling, and server initialization
 */

// ====== Load Environment Variables ======
dotenv.config();

// ====== Validate Required Environment Variables ======
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// ====== Initialize Express App ======
const app = express();

// ====== Connect to Database ======
connectDB();

// ====== Middleware Configuration ======
/**
 * CORS Configuration
 * Allows requests from specified origins
 */
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(','),
  credentials: true,
  optionsSuccessStatus: 200
}));

/**
 * Body Parser Middleware
 * Limits request size to prevent large payloads
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Routes
const errorHandler = require('./middleware/errorHandler');
app.use('/api/auth', require('./routes/unifiedAuthRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/recycle', require('./routes/recycleRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ngo', ngoRoutes);
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/community', require('./routes/requestRoutes'));
app.use('/api/ngo-ratings', require('./routes/ngoRatingRoutes'));
app.use('/api/recycler-ratings', require('./routes/recyclerRatingRoutes'));


/**
 * Request Logging Middleware (Development Only)
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
}

// ====== Route Imports ======
const ngoAuthRoutes = require('./routes/ngoAuthRoutes');
const recyclerAuthRoutes = require('./routes/recyclerAuthRoutes');
const recyclerRequestRoutes = require('./routes/recyclerRequestRoutes');
const recyclerDashboardRoutes = require('./routes/recyclerDashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const donationIntegrationRoutes = require('./routes/donationRoutes');
const recycleIntegrationRoutes = require('./routes/recycleIntegrationRoutes');

// ====== API Routes ======
/**
 * NGO Authentication Routes
 * @route /api/ngo/auth
 */
app.use('/api/ngo/auth', ngoAuthRoutes);

/**
 * Recycler Authentication Routes
 * @route /api/recycler/auth
 */
app.use('/api/recycler/auth', recyclerAuthRoutes);

/**
 * Recycler Request Routes
 * @route /api/recycler/requests
 */
app.use('/api/recycler/requests', recyclerRequestRoutes);

/**
 * Recycler Dashboard Routes
 * @route /api/recycler/dashboard
 */
app.use('/api/recycler/dashboard', recyclerDashboardRoutes);

/**
 * Recycler Notification Routes
 * @route /api/recycler/notifications
 */
app.use('/api/recycler/notifications', notificationRoutes);

/**
 * Household-Recycler Integration Routes
 * Bridges household donations with recycler requests
 * @route /api/integration
 */
app.use('/api/integration', donationIntegrationRoutes);

/**
 * Household-Recycler Recycle Integration Routes
 * Bridges household recycle requests with recycler operations
 * @route /api/integration/recycle
 */
app.use('/api/integration/recycle', recycleIntegrationRoutes);

// ====== Health Check Routes ======
/**
 * Root endpoint - API Information
 * @route GET /
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EcoLoop Recycler Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/recycler/auth',
      requests: '/api/recycler/requests',
      dashboard: '/api/recycler/dashboard',
      health: '/health'
    }
  });
});

/**
 * Health Check Endpoint
 * @route GET /health
 * @returns {Object} Server status
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
// ====== TEMPORARY BADGE SEED (DELETE AFTER USE) ======
app.get('/api/seed-badges-now', async (req, res) => {
  try {
    const Badge = require('./models/Badge');
    const badges = [
      { name: 'First Steps', description: 'Created your first donation or recycle request', icon: '🌱', category: 'DONATION', tier: 'BRONZE', points: 10, requirement: { type: 'COUNT', value: 1, action: 'DONATION' } },
      { name: 'Generous Giver', description: 'Completed 5 donations', icon: '🌿', category: 'DONATION', tier: 'SILVER', points: 50, requirement: { type: 'COUNT', value: 5, action: 'DONATION' } },
      { name: 'Donation Hero', description: 'Completed 20 donations', icon: '⭐', category: 'DONATION', tier: 'GOLD', points: 150, requirement: { type: 'COUNT', value: 20, action: 'DONATION' } },
      { name: 'Recycle Starter', description: 'Created your first recycle request', icon: '♻️', category: 'RECYCLE', tier: 'BRONZE', points: 10, requirement: { type: 'COUNT', value: 1, action: 'RECYCLE' } },
      { name: 'Eco Warrior', description: 'Completed 10 recycle requests', icon: '🌳', category: 'RECYCLE', tier: 'SILVER', points: 75, requirement: { type: 'COUNT', value: 10, action: 'RECYCLE' } },
      { name: 'Recycle Enthusiast', description: 'Completed 5 recycles', icon: '💚', category: 'RECYCLE', tier: 'SILVER', points: 100, requirement: { type: 'COUNT', value: 5, action: 'RECYCLE' } },
      { name: 'Green Guardian', description: 'Completed 10 recycles', icon: '🌟', category: 'RECYCLE', tier: 'GOLD', points: 200, requirement: { type: 'COUNT', value: 10, action: 'RECYCLE' } },
      { name: 'Sustainability Champion', description: 'Completed 50 total actions', icon: '🏆', category: 'MILESTONE', tier: 'GOLD', points: 300, requirement: { type: 'COUNT', value: 50, action: 'TOTAL_IMPACT' } },
      { name: 'Community Leader', description: 'Earned 1000 total points', icon: '👑', category: 'MILESTONE', tier: 'GOLD', points: 500, requirement: { type: 'COUNT', value: 1000, action: 'TOTAL_IMPACT' } },
      { name: 'Streak Master', description: '7 consecutive days', icon: '🔥', category: 'STREAK', tier: 'SILVER', points: 150, requirement: { type: 'STREAK', value: 7, action: 'CONSECUTIVE_DAYS' } },
      { name: 'Early Adopter', description: 'One of the first 100 users', icon: '🎖️', category: 'SPECIAL', tier: 'BRONZE', points: 50, requirement: { type: 'SPECIAL', value: 100, action: 'TOTAL_IMPACT' } },
      { name: 'Bronze Achiever', description: 'Earned your first bronze badge', icon: '🥉', category: 'MILESTONE', tier: 'BRONZE', points: 25, requirement: { type: 'COUNT', value: 1, action: 'TOTAL_IMPACT' } },
      { name: 'Silver Champion', description: 'Earned 5 silver badges', icon: '🥈', category: 'MILESTONE', tier: 'SILVER', points: 100, requirement: { type: 'COUNT', value: 5, action: 'TOTAL_IMPACT' } },
      { name: 'Gold Legend', description: 'Earned 3 gold badges', icon: '🥇', category: 'MILESTONE', tier: 'GOLD', points: 200, requirement: { type: 'COUNT', value: 3, action: 'TOTAL_IMPACT' } },
      { name: 'Consistency Star', description: '30 consecutive days', icon: '💎', category: 'STREAK', tier: 'GOLD', points: 300, requirement: { type: 'STREAK', value: 30, action: 'CONSECUTIVE_DAYS' } }
    ];
    await Badge.deleteMany({});
    const result = await Badge.insertMany(badges);
    res.json({ success: true, message: `${result.length} badges seeded!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// ====== END TEMPORARY SEED ======

// ====== 404 Handler ======
/**
 * Handle undefined routes
 */
app.use((req, res, next) => {
  console.log(`⚠️ 404 Not Found: ${req.method} ${req.path}`);
  
  const error = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    404
  );
  next(error);
});

// ====== Global Error Handler ======
/**
 * Centralized error handling middleware
 * Catches all errors from routes and middleware
 * 
 * Error Types Handled:
 * - Operational Errors (AppError)
 * - JWT Errors (JsonWebTokenError, TokenExpiredError)
 * - Mongoose Validation Errors
 * - Generic Server Errors
 */
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error details
  if (err.statusCode === 500) {
    console.error('❌ Server Error:', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn(`⚠️ ${err.statusCode} Error: ${err.message}`);
  }

  // Custom error response
  const response = {
    success: false,
    message: err.message,
    statusCode: err.statusCode
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(err.statusCode).json(response);
});

// ====== Handle Unhandled Promise Rejections ======
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // In production, you might want to restart the server or alert admins
});

// ====== Handle Uncaught Exceptions ======
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // In production, exit the process and let a process manager restart it
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// ====== Start Server ======
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   EcoLoop Recycler Backend             ║
║   🚀 Server Running                     ║
║   🔗 WebSocket Ready                    ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                            
║   Environment: ${process.env.NODE_ENV || 'development'}         
║   URL: http://localhost:${PORT}          
╚════════════════════════════════════════╝
  `);

  if (process.env.NODE_ENV === 'development') {
    console.log('📝 API Routes:');
    console.log('  POST   /api/recycler/auth/register');
    console.log('  POST   /api/recycler/auth/login');
    console.log('  GET    /api/recycler/auth/profile');
    console.log('  PUT    /api/recycler/auth/profile');
    console.log('  PUT    /api/recycler/auth/change-password');
    console.log('  POST   /api/recycler/auth/logout');
    console.log('  GET    /api/recycler/requests/available');
    console.log('  GET    /api/recycler/requests/nearby');
    console.log('  POST   /api/recycler/requests/:requestId/accept');
    console.log('  GET    /api/recycler/requests/my-requests');
    console.log('  PUT    /api/recycler/requests/:id/status');
    console.log('  GET    /api/recycler/requests/:id');
    console.log('  GET    /api/recycler/dashboard');
    console.log('  GET    /api/recycler/dashboard/performance');
    console.log('  GET    /api/recycler/dashboard/statistics');
  }
});

// ====== Handle Server Shutdown ======
process.on('SIGTERM', () => {
  console.log('⏹️ SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = server;
