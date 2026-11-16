/**
 * @file errorHandler.js
 * @description Centralized error handler for Profile Microservice.
 * Returns consistent structured JSON error responses.
 * @author Md Hussain Ansari (Member 1)
 */

class AppError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[ProfileService Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}

module.exports = {
  AppError,
  errorHandler
};
