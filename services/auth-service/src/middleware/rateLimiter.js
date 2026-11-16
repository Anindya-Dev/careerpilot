/**
 * @file rateLimiter.js
 * @description Rate limiting middleware protecting authentication endpoints from brute-force attacks.
 * Limits users to 10 login/register requests per 15-minute window in production and development.
 * Bypasses during automated unit/integration test runs to avoid test suite throttling.
 * @author Md Hussain Ansari (Member 1)
 */

const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, NODE_ENV } = require('../config/env');

const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  skip: (req) => NODE_ENV === 'test' && !req.headers['x-test-rate-limit'],
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
      }
    });
  }
});

module.exports = {
  authRateLimiter
};
