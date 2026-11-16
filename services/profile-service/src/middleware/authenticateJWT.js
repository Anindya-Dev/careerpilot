/**
 * @file authenticateJWT.js
 * @description Authentication guard middleware for the Profile Service.
 * Verifies Bearer JWT access tokens and injects req.user payload.
 * Also supports internal service calls carrying the valid internal service key.
 * @author Md Hussain Ansari (Member 1)
 */

const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, INTERNAL_SERVICE_KEY } = require('../config/env');
const { AppError } = require('./errorHandler');

function authenticateJWT(req, res, next) {
  // Allow internal service-to-service communication via secure internal key
  const internalKey = req.headers['x-internal-key'];
  if (internalKey && internalKey === INTERNAL_SERVICE_KEY) {
    const internalUserId = req.headers['x-user-id'];
    if (internalUserId) {
      req.user = { userId: internalUserId, isInternal: true };
      return next();
    }
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 'Access token is missing or malformed', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('TOKEN_EXPIRED', 'Access token has expired', 401));
    }
    return next(new AppError('INVALID_TOKEN', 'Access token is invalid', 401));
  }
}

/**
 * Guard for internal service-to-service endpoints (e.g. Agent Orchestrator ingestion).
 * Allows either valid JWT (student inspecting user profile) or valid internal key.
 */
function allowInternalOrAuth(req, res, next) {
  const internalKey = req.headers['x-internal-key'];
  if (internalKey && internalKey === INTERNAL_SERVICE_KEY) {
    return next();
  }

  return authenticateJWT(req, res, next);
}

module.exports = {
  authenticateJWT,
  allowInternalOrAuth
};
