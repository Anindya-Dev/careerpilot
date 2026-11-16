/**
 * @file authRoutes.js
 * @description API v1 route definitions for the authentication microservice.
 * @author Md Hussain Ansari (Member 1)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authenticateJWT');
const { authRateLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validateRequest');

// Public authentication routes (with rate limiting protection)
router.post('/register', authRateLimiter, validateRegister, authController.register);
router.post('/login', authRateLimiter, validateLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authRateLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateResetPassword, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Authenticated session routes
router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;
