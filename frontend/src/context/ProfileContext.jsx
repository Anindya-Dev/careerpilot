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
      // Graceful offline demo profile fallback
      console.warn('[CareerPilot Preview] Profile service offline. Using preview profile.');
      const localProfile = JSON.parse(localStorage.getItem('demo_profile') || 'null') || {
        userId: user.userId || 'demo-student-id-001',
        name: user.name || 'Student',
        email: user.email || 'student@careerpilot.io',
        major: user.major || 'Computer Science & Engineering',
        target_role: 'AI / Machine Learning Engineer',
        skills: [
          { name: 'Python', level: 'advanced', category: 'Languages', verified: true },
          { name: 'PyTorch', level: 'intermediate', category: 'Frameworks', verified: true },
          { name: 'Node.js', level: 'advanced', category: 'Frameworks', verified: true },
          { name: 'React', level: 'advanced', category: 'Frameworks', verified: false },
          { name: 'Docker', level: 'intermediate', category: 'DevOps & Cloud', verified: false }
        ],
        goals: [
          'Crack Top-Tier ML / AI Engineering Role',
          'Publish Graph Neural Networks Research Paper',
          'Contribute to Open Source LLM Frameworks'
        ],
        projects: [
          {
            title: 'CareerPilot AI',
            description: 'Multi-agent AI career intelligence & graph-based roadmap platform.',
            repo_url: 'https://github.com/Anindya-Dev/careerpilot',
            technologies: ['Node.js', 'Express', 'React', 'MongoDB', 'Python', 'Neo4j']
          },
          {
            title: 'Distributed Systems Key-Value Store',
            description: 'Raft consensus key-value store built in Go with automated cluster failover.',
            repo_url: 'https://github.com/example/raft-kv',
            technologies: ['Go', 'Raft', 'gRPC', 'Docker']
          }
        ],
        certifications: [
          { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', issue_date: '2025-06' }
        ],
        career_health_score: 84.5,
        profile_completeness: 85,
        linked_accounts: {
          github: user.email ? `${user.email.split('@')[0]}-dev` : 'student-dev',
          linkedin: user.email ? `linkedin.com/in/${user.email.split('@')[0]}` : 'linkedin.com/in/student'
        }
      };
      setProfile(localProfile);
      setError(null);
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
      console.warn('[CareerPilot Preview] Profile service offline. Saving updates to local state.');
      const current = profile || {};
      const updated = {
        ...current,
        ...updates,
        profile_completeness: 90
      };
      setProfile(updated);
      localStorage.setItem('demo_profile', JSON.stringify(updated));
      setError(null);
      return updated;
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
