/**
 * @file User.js
 * @description Mongoose User Schema storing primary student credentials and foundational metadata.
 * Features automated pre-save 12-round bcrypt hashing, credential verification methods,
 * and safe serialization omitting private keys/hashes.
 * @author Md Hussain Ansari (Member 1)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { BCRYPT_SALT_ROUNDS } = require('../config/env');

/**
 * UserSchema - Stores primary student credentials and foundational metadata.
 * Pre-save middleware enforces automated one-way bcrypt hashing before DB write.
 */
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    major: {
      type: String,
      default: '',
      trim: true
    },
    enrollmentYear: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save middleware: Automatically hash passwordHash field if modified before saving.
 * Uses 12 salt rounds as mandated by project security requirements.
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

/**
 * Instance method for safe password comparison during login.
 * @param {string} candidatePassword - Plaintext candidate password
 * @returns {Promise<boolean>} True if match, false otherwise
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Clean serialization method ensuring password hashes and sensitive tokens are never returned in responses.
 * @returns {object} Sanitized user document
 */
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);
