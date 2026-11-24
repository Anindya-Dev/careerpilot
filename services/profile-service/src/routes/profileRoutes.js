/**
 * @file profileRoutes.js
 * @description API v1 route mappings for the Profile microservice.
 * @author Md Hussain Ansari (Member 1)
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateJWT, allowInternalOrAuth } = require('../middleware/authenticateJWT');

// Student profile management endpoints
router.get('/me', authenticateJWT, profileController.getMe);
router.put('/me', authenticateJWT, profileController.updateMe);
router.delete('/me', authenticateJWT, profileController.deleteMe);

// Inter-service ingestion endpoint for Agent Orchestrator
router.get('/:userId', allowInternalOrAuth, profileController.getProfileByUserId);

module.exports = router;
