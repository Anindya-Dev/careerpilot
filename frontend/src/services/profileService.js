/**
 * @file profileService.js
 * @description Frontend API service communicating with CareerPilot Profile Microservice.
 * Handles Student Career Intelligence Profile CRUD operations.
 * @author Md Hussain Ansari (Member 1)
 */

import { profileClient } from '../api/client';

export const profileService = {
  /**
   * Fetch current authenticated student's full profile.
   */
  async getMyProfile() {
    const res = await profileClient.get('/me');
    return res.data.profile;
  },

  /**
   * Update student profile (skills, goals, projects, certifications, target_role).
   */
  async updateProfile(profileData) {
    const res = await profileClient.put('/me', profileData);
    return res.data.profile;
  }
};

export default profileService;
