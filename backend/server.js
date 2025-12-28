// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (e.g., curl, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'];
    if (allowed.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Ensure upload directories exist
const fs = require('fs');
const uploadDirs = ['uploads', 'uploads/waste-images', 'uploads/item-images'];
uploadDirs.forEach(dir => { if (!fs.existsSync(path.join(__dirname, dir))) fs.mkdirSync(path.join(__dirname, dir), { recursive: true }); });

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Import and mount routes
const authRoutes = require('./routes/auth.routes');
const wasteRoutes = require('./routes/waste.routes');
const lendRoutes = require('./routes/lend.routes');
const requestRoutes = require('./routes/request.routes');
const notificationRoutes = require('./routes/notification.routes');

app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/lend', lendRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);

// Admin routes
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Simple error handler (inline)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  const address = server.address();
  const host = address && address.address ? (address.address === '::' ? '127.0.0.1' : address.address) : HOST;
  console.log(`Server listening at http://${host}:${address.port}`);
  console.log(`\n╔════════════════════════════════════════╗\n║   SIDDHI Server Running Successfully   ║\n║   Port: ${PORT}                          ║\n║   Environment: ${process.env.NODE_ENV || 'development'}              ║\n╚════════════════════════════════════════╝\n  `);
});

// Graceful shutdown on signals
process.on('SIGINT', () => {
  console.log('SIGINT received: closing server');
  server.close(() => process.exit(0));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  if (server && server.close) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});