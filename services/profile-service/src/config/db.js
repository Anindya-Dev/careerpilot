/**
 * @file db.js
 * @description Mongoose connection manager with automated retry logic and pooling for the Profile Service.
 * @author Md Hussain Ansari (Member 1)
 */

const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 2000;

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

      console.log(`[ProfileService DB] MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[ProfileService DB] Connection attempt ${attempts} failed:`, error.message);
      if (attempts >= MAX_RETRIES) {
        throw new Error(`[ProfileService DB] Exhausted all ${MAX_RETRIES} connection attempts to MongoDB`);
      }
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempts - 1);
      console.log(`[ProfileService DB] Retrying connection in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[ProfileService DB] MongoDB disconnected gracefully');
  }
}

module.exports = {
  connectDB,
  disconnectDB
};
