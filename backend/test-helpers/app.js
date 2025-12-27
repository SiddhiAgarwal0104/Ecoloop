// test-helpers/app.js
// Starts the server in test mode with a test DB (use MONGODB_URI_TEST) and returns the running server

const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');

const appFile = path.join(__dirname, '..', 'server.js');

module.exports = {
  setup: async () => {
    // ensure test DB is set
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set in test env');
    // start server by requiring server.js but it runs immediately; instead we create a fresh express app and import routes
    const app = express();
    app.use(express.json());

    // mount routes manually to avoid starting multiple servers
    const authRoutes = require('../routes/auth.routes');
    const wasteRoutes = require('../routes/waste.routes');
    const notificationRoutes = require('../routes/notification.routes');

    app.use('/api/auth', authRoutes);
    app.use('/api/waste', wasteRoutes);
    app.use('/api/notifications', notificationRoutes);

    // simple health
    app.get('/health', (req, res) => res.status(200).json({ ok: true }));

    await connectDB();
    const server = app.listen(0); // random available port
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}`;
    server.url = url;
    console.log('Test server running at', url);
    return server;
  },
  teardown: async (server) => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  }
};