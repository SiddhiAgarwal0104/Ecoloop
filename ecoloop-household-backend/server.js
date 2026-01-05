// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const errorHandler = require('./middleware/errorHandler');
// const ngoRoutes = require('./routes/ngoRoutes');

// // After other routes
// dotenv.config();

// const app = express();

// // Database connection
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/donations', require('./routes/donationRoutes'));
// app.use('/api/recycle', require('./routes/recycleRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));
// app.use('/api/ngo', ngoRoutes);
// app.use('/api/leaderboard', require('./routes/leaderboardRoutes')); // ✅ ADD THIS LINE
// app.use('/api/badges', require('./routes/badgeRoutes')); // ✅ ADD THIS
// app.use('/api/chatbot', require('./routes/chatbotRoutes'));


// // Health check
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'success', 
//     message: 'EcoLoop Household Backend is running' 
//   });
// });

// // Error handler (must be last)
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./utils/socketService');

/**
 * EcoLoop - Unified Backend Server
 * Handles ALL modules: Household, NGO, Recycler
 * Port: 5000
 */

// ====== Load Environment Variables ======
dotenv.config();

// ====== Initialize Express App ======
const app = express();

// ====== Connect to Database ======
connectDB();

// ====== Middleware Configuration ======
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`🔥 ${req.method} ${req.path}`);
    next();
  });
}

// ====================================================================
// IMPORT ALL ROUTES
// ====================================================================

// Authentication & User Management
const authRoutes = require('./routes/authRoutes');

// Household Module
const donationRoutes = require('./routes/donationRoutes');
const recycleRoutes = require('./routes/recycleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const householdNotificationRoutes = require('./routes/notificationRoutes');
const rewardsRoutes = require('./routes/rewardsRoutes');

// NGO Module
const ngoRoutes = require('./routes/ngoRoutes');

// Recycler Module (Consolidated)
const recyclerRoutes = require('./routes/recyclerRoutes');
const recyclerNotificationRoutes = require('./routes/recyclerNotificationRoutes');

// Gamification
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const badgeRoutes = require('./routes/badgeRoutes');

// AI Features
const chatbotRoutes = require('./routes/chatbotRoutes');

// Integration Routes
const integrationRoutes = require('./routes/integrationRoutes'); // NGO-Household
const recycleIntegrationRoutes = require('./routes/recycleIntegrationRoutes'); // Recycler-Household

// ====================================================================
// API ROUTES CONFIGURATION
// ====================================================================

// ────────────────────────────────────────────────────────────────
// AUTHENTICATION
// ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ────────────────────────────────────────────────────────────────
// HOUSEHOLD MODULE
// ────────────────────────────────────────────────────────────────
app.use('/api/donations', donationRoutes);
app.use('/api/recycle', recycleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', householdNotificationRoutes);
app.use('/api/rewards', rewardsRoutes);

// ────────────────────────────────────────────────────────────────
// NGO MODULE
// ────────────────────────────────────────────────────────────────
app.use('/api/ngo', ngoRoutes);

// ────────────────────────────────────────────────────────────────
// RECYCLER MODULE (Consolidated)
// ────────────────────────────────────────────────────────────────
app.use('/api/recycler', recyclerRoutes); // All recycler features
app.use('/api/recycler/notifications', recyclerNotificationRoutes);

// ────────────────────────────────────────────────────────────────
// GAMIFICATION
// ────────────────────────────────────────────────────────────────
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);

// ────────────────────────────────────────────────────────────────
// AI FEATURES
// ────────────────────────────────────────────────────────────────
app.use('/api/chatbot', chatbotRoutes);

// ────────────────────────────────────────────────────────────────
// INTEGRATION ROUTES
// ────────────────────────────────────────────────────────────────
app.use('/api/integration', integrationRoutes); // NGO-Household donations
app.use('/api/integration/recycle', recycleIntegrationRoutes); // Recycler-Household

// ====================================================================
// HEALTH CHECK & INFO ROUTES
// ====================================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EcoLoop Unified Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    modules: {
      authentication: '/api/auth',
      household: {
        donations: '/api/donations',
        recycle: '/api/recycle',
        dashboard: '/api/dashboard',
        notifications: '/api/notifications',
        rewards: '/api/rewards'
      },
      ngo: '/api/ngo',
      recycler: {
        main: '/api/recycler',
        notifications: '/api/recycler/notifications'
      },
      gamification: {
        leaderboard: '/api/leaderboard',
        badges: '/api/badges'
      },
      ai: {
        chatbot: '/api/chatbot'
      },
      integration: {
        donations: '/api/integration',
        recycle: '/api/integration/recycle'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'EcoLoop Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ====================================================================
// ERROR HANDLING
// ====================================================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`,
    statusCode: 404
  });
});

// Global Error Handler
app.use(errorHandler);

// ====================================================================
// SERVER INITIALIZATION
// ====================================================================

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO for real-time features
initSocket(server);

server.listen(PORT, () => {
  console.log(`done `);

  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔍 Quick Route Reference:');
    console.log('   Authentication:  POST /api/auth/login');
    console.log('   Household:       GET  /api/dashboard');
    console.log('   NGO:             GET  /api/ngo/donations/available');
    console.log('   Recycler:        GET  /api/recycler/dashboard');
    console.log('   Health Check:    GET  /api/health');
    console.log('\n💡 Visit http://localhost:' + PORT + ' for full API documentation\n');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

module.exports = server;