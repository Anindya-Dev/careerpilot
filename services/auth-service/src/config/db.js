/**
 * @file db.js
 * @description Mongoose connection manager featuring connection pooling, event listeners,
 * and retry logic with exponential backoff for enterprise resilience.
 * @author Md Hussain Ansari (Member 1)
 */

const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 2000;

/**
 * Connect to MongoDB with automated retry logic and exponential backoff.
 * @param {string} [uri] - Optional MongoDB URI (defaults to env.MONGO_URI)
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(uri = MONGO_URI) {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      attempts++;
      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });

      console.log(`[AuthService DB] MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[AuthService DB] Connection attempt ${attempts} failed:`, error.message);
      if (attempts >= MAX_RETRIES) {
        throw new Error(`[AuthService DB] Exhausted all ${MAX_RETRIES} connection attempts to MongoDB`);
      }
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempts - 1);
      console.log(`[AuthService DB] Retrying connection in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

/**
 * Disconnect from MongoDB gracefully during server shutdown or test teardown.
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[AuthService DB] MongoDB disconnected gracefully');
  }
}

module.exports = {
  connectDB,
  disconnectDB
};
