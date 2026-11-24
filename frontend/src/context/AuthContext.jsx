/**
 * @file AuthContext.jsx
 * @description Centralized React Context for user authentication state management.
 * Seamlessly integrates Clerk OAuth (Google, GitHub) with CareerPilot's internal
 * microservices JWT auth and offline Sandbox evaluation mode.
 * @author Md Hussain Ansari (Member 1) & Anindya Bhattacharya (Member 2)
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { useClerkConfig } from './ClerkProviderWrapper';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
}

/**
 * Clerk Synchronization Listener.
 * Safely mounts ONLY when ClerkProvider is active.
 */
function ClerkSyncListener({ onSync }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || 'student@careerpilot.io';
      const name = clerkUser.fullName || clerkUser.firstName || email.split('@')[0];
      
      const syncedUser = {
        userId: clerkUser.id,
        name,
        email,
        imageUrl: clerkUser.imageUrl,
        isClerkSession: true,
        major: 'Computer Science & Engineering',
        enrollmentYear: new Date().getFullYear()
      };

      const token = `clerk-jwt-${clerkUser.id}`;
      onSync(syncedUser, token);
    }
  }, [isLoaded, isSignedIn, clerkUser, onSync]);

  return null;
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { isClerkConfigured } = useClerkConfig();

  // Validate existing token on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        return dispatch({ type: 'AUTH_LOGOUT' });
      }

      // Check for Clerk cached session
      if (storedToken.startsWith('clerk-jwt-')) {
        const savedClerkUser = JSON.parse(localStorage.getItem('clerk_user') || 'null');
        if (savedClerkUser) {
          return dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: savedClerkUser, token: storedToken }
          });
        }
      }

      // Check for Demo Sandbox session
      if (storedToken === 'demo-jwt-preview-token') {
        const saved = JSON.parse(localStorage.getItem('demo_user') || 'null') || {
          userId: 'demo-student-id-001',
          name: 'Sample Student (Demo Sandbox)',
          email: 'demo@careerpilot.io',
          major: 'Computer Science & Engineering',
          enrollmentYear: 2024,
          isDemoSession: true
        };
        return dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: saved, token: storedToken }
        });
      }

      // Standard Auth-Service JWT token check
      try {
        const user = await authService.getMe();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: storedToken }
        });
      } catch (err) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initAuth();
  }, []);

  const handleClerkSync = useCallback((clerkUser, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('clerk_user', JSON.stringify(clerkUser));
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user: clerkUser, token }
    });
  }, []);

  /**
   * Internal Microservice Login
   */
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.accessToken);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data.user, token: data.accessToken }
      });
      return { success: true, user: data.user };
    } catch (err) {
      let errorMsg = 'Login failed. Please check your credentials.';
      if (!err.response) {
        errorMsg = 'Cannot connect to Auth Service (http://localhost:5001). Ensure the backend server and MongoDB are running.';
      } else if (err.response.data?.error?.message) {
        errorMsg = err.response.data.error.message;
      }
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw new Error(errorMsg);
    }
  };

  /**
   * Internal Microservice Registration
   */
  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authService.register(userData);
      localStorage.setItem('token', data.accessToken);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data.user, token: data.accessToken }
      });
      return { success: true, user: data.user };
    } catch (err) {
      let errorMsg = 'Registration failed. Please check your details.';
      if (!err.response) {
        errorMsg = 'Cannot connect to Auth Service (http://localhost:5001). Ensure the backend server and MongoDB are running.';
      } else if (err.response.data?.error?.message) {
        errorMsg = err.response.data.error.message;
      }
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw new Error(errorMsg);
    }
  };

  /**
   * Demo Sandbox / Evaluation Mode
   */
  const enterDemoMode = () => {
    const demoUser = {
      userId: 'demo-student-id-001',
      name: 'Sample Student (Demo Sandbox)',
      email: 'demo@careerpilot.io',
      major: 'Computer Science & Engineering',
      enrollmentYear: 2024,
      isDemoSession: true
    };
    const demoToken = 'demo-jwt-preview-token';
    localStorage.setItem('token', demoToken);
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user: demoUser, token: demoToken }
    });
    return demoUser;
  };

  /**
   * Unified Logout
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_profile');
      localStorage.removeItem('clerk_user');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, enterDemoMode }}>
      {isClerkConfigured && <ClerkSyncListener onSync={handleClerkSync} />}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
