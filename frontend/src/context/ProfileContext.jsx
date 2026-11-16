/**
 * @file ProfileContext.jsx
 * @description React Context for managing student career intelligence profile state.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import profileService from '../services/profileService';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const updateProfile = async (updates) => {
    setIsLoading(true);
    try {
      const updated = await profileService.updateProfile(updates);
      setProfile(updated);
      setError(null);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error, fetchProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;
