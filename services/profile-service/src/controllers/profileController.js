/**
 * @file profileController.js
 * @description Controllers for Student Career Intelligence Profile CRUD operations and Agent Orchestrator data ingestion.
 * @author Md Hussain Ansari (Member 1)
 */

const Profile = require('../models/Profile');
const { AppError } = require('../middleware/errorHandler');

/**
 * Fetch the authenticated student's profile.
 * If profile does not exist yet, initializes a profile skeleton using the JWT claims.
 * Endpoint: GET /api/v1/profile/me
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.userId;

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Auto-bootstrap profile with available identity metadata from JWT
      profile = await Profile.create({
        userId,
        name: req.user.name || 'Student',
        email: req.user.email || 'student@careerpilot.io',
        major: req.user.major || '',
        skills: [],
        goals: [],
        projects: [],
        certifications: []
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upsert authenticated student's career intelligence profile.
 * Endpoint: PUT /api/v1/profile/me
 */
async function updateMe(req, res, next) {
  try {
    const userId = req.user.userId;
    const {
      name,
      major,
      target_role,
      skills,
      goals,
      projects,
      certifications,
      linked_accounts
    } = req.body;

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      profile = new Profile({
        userId,
        name: name || req.user.name || 'Student',
        email: req.user.email || 'student@careerpilot.io'
      });
    }

    if (name !== undefined) profile.name = name;
    if (major !== undefined) profile.major = major;
    if (target_role !== undefined) profile.target_role = target_role;
    if (Array.isArray(skills)) profile.skills = skills;
    if (Array.isArray(goals)) profile.goals = goals;
    if (Array.isArray(projects)) profile.projects = projects;
    if (Array.isArray(certifications)) profile.certifications = certifications;
    if (linked_accounts !== undefined) {
      profile.linked_accounts = {
        ...profile.linked_accounts,
        ...linked_accounts
      };
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch profile by unique userId.
 * Used internally by Member 2's Agent Orchestrator during LangGraph DAG execution.
 * Endpoint: GET /api/v1/profile/:userId
 */
async function getProfileByUserId(req, res, next) {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return next(new AppError('PROFILE_NOT_FOUND', `No profile found for userId: ${userId}`, 404));
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete authenticated student profile.
 * Endpoint: DELETE /api/v1/profile/me
 */
async function deleteMe(req, res, next) {
  try {
    const userId = req.user.userId;
    const result = await Profile.findOneAndDelete({ userId });

    if (!result) {
      return next(new AppError('PROFILE_NOT_FOUND', 'Profile does not exist', 404));
    }

    return res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMe,
  updateMe,
  getProfileByUserId,
  deleteMe
};
