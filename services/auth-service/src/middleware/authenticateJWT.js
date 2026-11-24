/**
 * @file authenticateJWT.js
 * @description Authentication guard middleware. Inspects Authorization header for valid Bearer token,
 * decodes payload, and injects user context into req.user.
 * @author Md Hussain Ansari (Member 1)
 */

const { verifyAccessToken } = require('../utils/tokenService');
const { AppError } = require('./errorHandler');

/**
 * Authenticate incoming HTTP request via JWT Bearer token.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 'Access token is missing or malformed', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('TOKEN_EXPIRED', 'Access token has expired', 401));
    }
    return next(new AppError('INVALID_TOKEN', 'Access token is invalid', 401));
  }
}

module.exports = {
  authenticateJWT
};
