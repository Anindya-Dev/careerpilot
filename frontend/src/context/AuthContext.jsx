/**
 * @file AuthContext.jsx
 * @description Centralized React Context for user authentication state management.
 * Follows useReducer pattern mandated by the Member 1 Handbook.
 * Provides login, register, logout, and token hydration hooks.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

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

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Validate existing token on initial application load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        return dispatch({ type: 'AUTH_LOGOUT' });
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
      const msg = err.response?.data?.error?.message || err.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
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
      const msg = err.response?.data?.error?.message || err.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
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
