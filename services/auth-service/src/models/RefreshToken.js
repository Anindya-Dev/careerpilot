/**
 * @file RefreshToken.js
 * @description Mongoose schema for persistent refresh tokens supporting cryptographic rotation,
 * multi-device session tracking, and instant revocation.
 * @author Md Hussain Ansari (Member 1)
 */

const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically deletes expired tokens
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    replacedByTokenHash: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
