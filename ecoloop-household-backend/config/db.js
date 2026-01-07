const mongoose = require('mongoose');

/**
 * Database Connection Module
 * Handles MongoDB connection using Mongoose ODM
 * Implements connection pooling and error handling
 */

/**
 * Connect to MongoDB database
 * @async
 * @returns {Promise<Connection>} MongoDB connection object
 * @throws {Error} If connection fails
 */
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');

    const mongoURL = process.env.MONGODB_URI;

    if (!mongoURL) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 * @async
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error('❌ Disconnect Error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
