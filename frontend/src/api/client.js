/**
 * @file client.js
 * @description Centralized Axios HTTP client configured with JWT interceptors.
 * Injects Authorization Bearer tokens automatically and handles global error responses.
 * @author Md Hussain Ansari (Member 1)
 */

import axios from 'axios';

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001/api/v1/auth',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const profileClient = axios.create({
  baseURL: import.meta.env.VITE_PROFILE_API_URL || 'http://localhost:5002/api/v1/profile',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor: Attach JWT token to outgoing requests
const attachAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authClient.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
profileClient.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// Response interceptor: Handle session expiration (401)
const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    // Only redirect if not already on login or register page
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

authClient.interceptors.response.use((res) => res, handleAuthError);
profileClient.interceptors.response.use((res) => res, handleAuthError);

export { authClient, profileClient };
