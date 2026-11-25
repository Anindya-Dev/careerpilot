/**
 * @file ProfileContext.jsx
 * @description React Context for managing student career intelligence profile state.
 * Separates Demo Sandbox preview data from genuine authenticated student profiles
 * so new users start with a clean, honest profile rather than fabricated data.
 * @author Md Hussain Ansari (Member 1) & Anindya Bhattacharya (Member 2)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import profileService from '../services/profileService';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

function computeCompleteness(p) {
  let score = 15; // Base identity (name, email, major)
  if (p.target_role && p.target_role.trim() !== '') score += 15;
  if (Array.isArray(p.skills) && p.skills.length > 0) score += 20;
  if (Array.isArray(p.projects) && p.projects.length > 0) score += 20;
  if (Array.isArray(p.goals) && p.goals.length > 0) score += 15;
  if (p.linked_accounts?.github || p.linked_accounts?.linkedin) score += 15;
  return Math.min(score, 100);
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);

    // 1. Explicit Demo Sandbox mode: load sample evaluation data
    if (user.isDemoSession) {
      const demoProfile = JSON.parse(localStorage.getItem('demo_profile') || 'null') || {
        userId: 'demo-student-id-001',
        name: user.name || 'Sample Student (Demo Sandbox)',
        email: user.email || 'demo@careerpilot.io',
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
          github: 'demo-student-dev',
          linkedin: 'linkedin.com/in/demo-student'
        }
      };
      setProfile(demoProfile);
      setError(null);
      setIsLoading(false);
      return;
    }

    // 2. Genuine authenticated user: fetch from Profile Microservice or per-user local cache
    const storageKey = `profile_${user.userId}`;
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
      setError(null);
    } catch (err) {
      // Profile service offline: load user's own saved profile or a clean empty slate (NO fake data)
      const savedUserProfile = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (savedUserProfile) {
        setProfile(savedUserProfile);
      } else {
        const cleanProfile = {
          userId: user.userId,
          name: user.name || 'Student',
          email: user.email || '',
          major: user.major || 'Computer Science & Engineering',
          target_role: '',
          skills: [],
          goals: [],
          projects: [],
          certifications: [],
          career_health_score: 0,
          profile_completeness: 15,
          linked_accounts: {
            github: '',
            linkedin: ''
          }
        };
        setProfile(cleanProfile);
      }
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
      if (user && !user.isDemoSession) {
        localStorage.setItem(`profile_${user.userId}`, JSON.stringify(updated));
      }
      setError(null);
      return updated;
    } catch (err) {
      const current = profile || {};
      const merged = {
        ...current,
        ...updates
      };
      merged.profile_completeness = computeCompleteness(merged);
      if (!merged.career_health_score && merged.skills?.length > 0) {
        merged.career_health_score = Math.min(40 + merged.skills.length * 8 + (merged.projects?.length || 0) * 10, 95);
      }
      setProfile(merged);
      const storageKey = user?.isDemoSession ? 'demo_profile' : `profile_${user?.userId}`;
      localStorage.setItem(storageKey, JSON.stringify(merged));
      setError(null);
      return merged;
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
