/**
 * @file validateRequest.js
 * @description Request payload validation rules for authentication endpoints.
 * Validates email format, password complexity (min 8 chars), and required metadata fields.
 * @author Md Hussain Ansari (Member 1)
 */

const { AppError } = require('./errorHandler');

/**
 * Validate registration request payload.
 */
function validateRegister(req, res, next) {
  const { email, password, name, major } = req.body || {};

  if (!email || typeof email !== 'string') {
    return next(new AppError('INVALID_INPUT', 'A valid email string is required', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return next(new AppError('INVALID_EMAIL', 'Email format is invalid', 400));
  }

  if (!password || typeof password !== 'string') {
    return next(new AppError('INVALID_INPUT', 'Password is required', 400));
  }

  if (password.length < 8) {
    return next(new AppError('WEAK_PASSWORD', 'Password must be at least 8 characters long', 400));
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('INVALID_INPUT', 'Full name is required', 400));
  }

  req.body.email = email.trim().toLowerCase();
  req.body.name = name.trim();
  if (major && typeof major === 'string') {
    req.body.major = major.trim();
  }

  next();
}

/**
 * Validate login request payload.
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(new AppError('MISSING_CREDENTIALS', 'Email and password are required', 400));
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(new AppError('INVALID_INPUT', 'Email and password must be strings', 400));
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

/**
 * Validate forgot password payload.
 */
function validateForgotPassword(req, res, next) {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return next(new AppError('INVALID_INPUT', 'A valid email is required', 400));
  }
  req.body.email = email.trim().toLowerCase();
  next();
}

/**
 * Validate reset password payload.
 */
function validateResetPassword(req, res, next) {
  const { token, newPassword } = req.body || {};
  if (!token || typeof token !== 'string') {
    return next(new AppError('INVALID_INPUT', 'Reset token is required', 400));
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return next(new AppError('WEAK_PASSWORD', 'New password must be at least 8 characters long', 400));
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
