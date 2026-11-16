/**
 * @file env.js
 * @description Centralized environment configuration and constants for the Auth Microservice.
 * Follows 12-factor application design principles to ensure zero hardcoded secrets or magic numbers.
 * @author Md Hussain Ansari (Member 1)
 */

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot_auth',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'careerpilot_default_dev_access_secret_do_not_use_in_prod',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'careerpilot_default_dev_refresh_secret_do_not_use_in_prod',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 10 // 10 login requests per window
};
