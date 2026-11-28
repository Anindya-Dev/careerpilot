/**
 * @file tokenService.js
 * @description Utility for signing, verifying, and hashing JSON Web Tokens (Access & Refresh tokens).
 * Strictly adheres to RFC 7519 standards and enforces token rotation patterns.
 * @author Md Hussain Ansari (Member 1)
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN
} = require('../config/env');

/**
 * Generate a short-lived JWT Access Token (15 minutes default).
 * @param {object} user - User document or minimal payload { id, email, name, major }
 * @returns {string} Signed JWT Access Token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id ? user._id.toString() : user.userId || user.id,
      email: user.email,
      name: user.name,
      major: user.major || ''
    },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );
}

/**
 * Generate a long-lived JWT Refresh Token (7 days default).
 * @param {object} user - User document or minimal payload
 * @returns {string} Signed JWT Refresh Token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user._id ? user._id.toString() : user.userId || user.id,
      jti: crypto.randomUUID()
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

/**
 * Verify a JWT Access Token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

/**
 * Verify a JWT Refresh Token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

/**
 * Cryptographically hash a token using SHA-256 for secure database storage.
 * @param {string} token
 * @returns {string} Hex-encoded SHA-256 hash
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calculate token expiration Date based on duration string (e.g., '7d', '15m').
 * @param {string} durationStr
 * @returns {Date}
 */
function calculateExpiryDate(durationStr = '7d') {
  const match = durationStr.match(/^(\d+)([smhd])$/);
  const now = new Date();
  if (!match) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days fallback
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return new Date(now.getTime() + value * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd':
    default:
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  calculateExpiryDate
};
