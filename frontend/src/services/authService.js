/**
 * @file authService.js
 * @description Frontend API service communicating with CareerPilot Auth Microservice.
 * @author Md Hussain Ansari (Member 1)
 */

import { authClient } from '../api/client';

export const authService = {
  /**
   * Register a new student account.
   */
  async register(data) {
    const res = await authClient.post('/register', data);
    return res.data;
  },

  /**
   * Authenticate student with email and password.
   */
  async login(email, password) {
    const res = await authClient.post('/login', { email, password });
    return res.data;
  },

  /**
   * Fetch current authenticated user's profile details.
   */
  async getMe() {
    const res = await authClient.get('/me');
    return res.data.user;
  },

  /**
   * Invalidate current user session and remove tokens.
   */
  async logout() {
    try {
      const res = await authClient.post('/logout');
      return res.data;
    } catch (err) {
      // Even if network fails, proceed with client cleanup
      return { success: true };
    }
  },

  /**
   * Request password reset email / console link.
   */
  async forgotPassword(email) {
    const res = await authClient.post('/forgot-password', { email });
    return res.data;
  },

  /**
   * Reset password with reset token.
   */
  async resetPassword(token, newPassword) {
    const res = await authClient.post('/reset-password', { token, newPassword });
    return res.data;
  }
};

export default authService;
