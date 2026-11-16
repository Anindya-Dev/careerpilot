/**
 * @file authController.js
 * @description Controllers for all authentication workflows: registration, login, token rotation,
 * logout, current session inspection, and password reset flows.
 * @author Md Hussain Ansari (Member 1)
 */

const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  calculateExpiryDate
} = require('../utils/tokenService');
const { AppError } = require('../middleware/errorHandler');
const { JWT_REFRESH_EXPIRES_IN, NODE_ENV } = require('../config/env');

/**
 * Configure standard secure HTTP-only cookie options for refresh tokens.
 */
function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  };
}

/**
 * Register a new student account.
 * Endpoint: POST /api/v1/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, name, major, enrollmentYear } = req.body;

    // Check for existing account
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError('DUPLICATE_EMAIL', 'An account with this email already exists', 409));
    }

    // Create user (passwordHash is automatically hashed by pre-save hook)
    const user = new User({
      email,
      passwordHash: password,
      name,
      major: major || '',
      enrollmentYear: enrollmentYear || new Date().getFullYear()
    });

    await user.save();

    // Issue tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist hashed refresh token for revocation and rotation
    const tokenHash = hashToken(refreshToken);
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: calculateExpiryDate(JWT_REFRESH_EXPIRES_IN)
    });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    return res.status(201).json({
      success: true,
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate student credentials and issue access + refresh tokens.
 * Endpoint: POST /api/v1/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('ACCOUNT_DISABLED', 'Your account has been deactivated', 403));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401));
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const tokenHash = hashToken(refreshToken);
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: calculateExpiryDate(JWT_REFRESH_EXPIRES_IN)
    });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rotate refresh token and issue a fresh access token.
 * Endpoint: POST /api/v1/auth/refresh
 */
async function refresh(req, res, next) {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingToken) {
      return next(new AppError('MISSING_TOKEN', 'Refresh token is required', 400));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingToken);
    } catch (err) {
      return next(new AppError('INVALID_TOKEN', 'Refresh token is expired or malformed', 401));
    }

    const oldTokenHash = hashToken(incomingToken);
    const storedToken = await RefreshToken.findOne({ tokenHash: oldTokenHash });

    if (!storedToken || storedToken.isRevoked) {
      // Possible token reuse / breach: revoke all sessions for this user
      if (storedToken && storedToken.isRevoked) {
        await RefreshToken.updateMany({ userId: storedToken.userId }, { isRevoked: true });
      }
      return next(new AppError('REVOKED_TOKEN', 'Refresh token has been revoked or is invalid', 401));
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new AppError('USER_NOT_FOUND', 'User session no longer valid', 401));
    }

    // Token rotation: Issue new access & refresh tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newTokenHash = hashToken(newRefreshToken);

    // Invalidate old token and link to replacement
    storedToken.isRevoked = true;
    storedToken.replacedByTokenHash = newTokenHash;
    await storedToken.save();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt: calculateExpiryDate(JWT_REFRESH_EXPIRES_IN)
    });

    res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Invalidate user session and clear auth cookies.
 * Endpoint: POST /api/v1/auth/logout
 */
async function logout(req, res, next) {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (incomingToken) {
      const tokenHash = hashToken(incomingToken);
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
    }

    if (req.user && req.user.userId) {
      await RefreshToken.updateMany({ userId: req.user.userId }, { isRevoked: true });
    }

    const { maxAge, ...clearOptions } = getRefreshCookieOptions();
    res.clearCookie('refreshToken', clearOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch authenticated student's profile metadata.
 * Endpoint: GET /api/v1/auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new AppError('USER_NOT_FOUND', 'User record could not be found', 404));
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        major: user.major,
        enrollmentYear: user.enrollmentYear,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate password reset token and log recovery URL to console.
 * Endpoint: POST /api/v1/auth/forgot-password
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // For security, always return success even if user not found to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a password reset link has been generated.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    console.log(`\n======================================================`);
    console.log(`[PASSWORD RESET] For user ${email}:`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      success: true,
      message: 'Password reset link generated and logged to console.',
      resetToken: NODE_ENV === 'test' ? resetToken : undefined // Expose in test environment for assertion
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password using valid cryptographic reset token.
 * Endpoint: POST /api/v1/auth/reset-password
 */
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return next(new AppError('INVALID_TOKEN', 'Reset token is invalid or has expired', 400));
    }

    // Setting passwordHash triggers the pre-save bcrypt hook
    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully updated.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};
