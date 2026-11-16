/**
 * @file env.js
 * @description Centralized environment configuration and constants for the Profile Microservice.
 * @author Md Hussain Ansari (Member 1)
 */

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 5002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot_profile',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'careerpilot_default_dev_access_secret_do_not_use_in_prod',
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || 'careerpilot_internal_agent_secret_key_2026',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};
