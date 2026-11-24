/**
 * @file AuthContext.jsx
 * @description Centralized React Context for user authentication state management.
 * Seamlessly routes login/registration through Clerk Cloud (OAuth, Email/Password)
 * when configured, while retaining offline Demo Sandbox and microservice fallbacks.
 * @author Md Hussain Ansari (Member 1) & Anindya Bhattacharya (Member 2)
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import { useClerkConfig } from './ClerkProviderWrapper';
import { useSignIn, useSignUp, useUser, useClerk } from '@clerk/clerk-react';

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
 * Clerk-Powered Provider
 * Handles Email/Password + OAuth via Clerk Cloud without requiring local MongoDB.
 */
function ClerkActiveAuthProvider({ children, state, dispatch }) {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { user: clerkUser, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  // Sync logged-in Clerk user on mount / session change
  useEffect(() => {
    if (isUserLoaded && isSignedIn && clerkUser) {
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
      localStorage.setItem('token', token);
      localStorage.setItem('clerk_user', JSON.stringify(syncedUser));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: syncedUser, token }
      });
    }
  }, [isUserLoaded, isSignedIn, clerkUser, dispatch]);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (!isSignInLoaded) {
        throw new Error('Clerk authentication service initializing. Please retry in a second.');
      }
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        const user = {
          userId: result.createdUserId || result.createdSessionId,
          name: email.split('@')[0],
          email,
          isClerkSession: true,
          major: 'Computer Science & Engineering',
          enrollmentYear: new Date().getFullYear()
        };
        const token = `clerk-jwt-${user.userId}`;
        localStorage.setItem('token', token);
        localStorage.setItem('clerk_user', JSON.stringify(user));
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        return { success: true, user };
      } else {
        throw new Error(`Authentication requires additional verification: ${result.status}`);
      }
    } catch (err) {
      const errorMsg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        'Invalid email or password';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw new Error(errorMsg);
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (!isSignUpLoaded) {
        throw new Error('Clerk registration service initializing. Please retry in a second.');
      }
      const result = await signUp.create({
        emailAddress: userData.email,
        password: userData.password,
        firstName: userData.name,
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        const user = {
          userId: result.createdUserId || result.createdSessionId,
          name: userData.name,
          email: userData.email,
          major: userData.major || 'Computer Science & Engineering',
          enrollmentYear: userData.enrollmentYear || new Date().getFullYear(),
          isClerkSession: true
        };
        const token = `clerk-jwt-${user.userId}`;
        localStorage.setItem('token', token);
        localStorage.setItem('clerk_user', JSON.stringify(user));
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        return { success: true, user };
      } else if (result.status === 'missing_requirements') {
        // Send email verification code if enabled in Clerk dashboard
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        return {
          needsVerification: true,
          email: userData.email,
          message: 'A verification code has been sent to your email.'
        };
      } else {
        throw new Error(`Registration status: ${result.status}`);
      }
    } catch (err) {
      const errorMsg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        'Registration failed. Please check your credentials.';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw new Error(errorMsg);
    }
  };

  const verifyEmailCode = async (code) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        const user = {
          userId: result.createdUserId || result.createdSessionId,
          name: result.firstName || 'Student',
          email: result.emailAddress,
          isClerkSession: true,
          major: 'Computer Science & Engineering',
          enrollmentYear: new Date().getFullYear()
        };
        const token = `clerk-jwt-${user.userId}`;
        localStorage.setItem('token', token);
        localStorage.setItem('clerk_user', JSON.stringify(user));
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        return { success: true, user };
      } else {
        throw new Error('Verification incomplete. Please check the code.');
      }
    } catch (err) {
      const errorMsg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        'Invalid verification code.';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw new Error(errorMsg);
    }
  };

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

  const logout = async () => {
    try {
      if (clerk?.signOut) await clerk.signOut();
    } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_profile');
    localStorage.removeItem('clerk_user');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verifyEmailCode,
        logout,
        enterDemoMode,
        isClerkActive: true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Standard Local Backend Provider
 * Used when Clerk is not configured or in offline fallback mode.
 */
function StandardAuthProvider({ children, state, dispatch }) {
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

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_profile');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verifyEmailCode: async () => ({ success: true }),
        logout,
        enterDemoMode,
        isClerkActive: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { isClerkConfigured } = useClerkConfig();

  // Validate existing stored token on app boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        return dispatch({ type: 'AUTH_LOGOUT' });
      }

      if (storedToken.startsWith('clerk-jwt-')) {
        const savedClerkUser = JSON.parse(localStorage.getItem('clerk_user') || 'null');
        if (savedClerkUser) {
          return dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: savedClerkUser, token: storedToken }
          });
        }
      }

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

  if (isClerkConfigured) {
    return (
      <ClerkActiveAuthProvider state={state} dispatch={dispatch}>
        {children}
      </ClerkActiveAuthProvider>
    );
  }

  return (
    <StandardAuthProvider state={state} dispatch={dispatch}>
      {children}
    </StandardAuthProvider>
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
