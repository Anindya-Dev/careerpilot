/**
 * @file client.js
 * @description Centralized Axios HTTP client configured with JWT interceptors,
 * automatic token refresh queue, roundtrip latency telemetry tracking,
 * and multi-service routing (Auth, Profile, Agent Orchestrator).
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import axios from 'axios';

// ─── Environment Base URLs ───────────────────────────────────
const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001/api/v1/auth';
const PROFILE_BASE_URL =
  import.meta.env.VITE_PROFILE_API_URL || 'http://localhost:5002/api/v1/profile';
const ORCHESTRATOR_BASE_URL =
  import.meta.env.VITE_ORCHESTRATOR_API_URL || 'http://localhost:8000/api/v1';

// ─── Service Clients ─────────────────────────────────────────
export const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const profileClient = axios.create({
  baseURL: PROFILE_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const orchestratorClient = axios.create({
  baseURL: ORCHESTRATOR_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000,
  withCredentials: true
});

// ─── Token Refresh Coordination (Member 4) ───────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor: JWT Injection & Latency Metadata ───
const attachTelemetryAndToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Telemetry metadata: capture request timestamp for roundtrip profiling
  config.metadata = { startTime: Date.now() };

  return config;
};

authClient.interceptors.request.use(attachTelemetryAndToken, (err) => Promise.reject(err));
profileClient.interceptors.request.use(attachTelemetryAndToken, (err) => Promise.reject(err));
orchestratorClient.interceptors.request.use(attachTelemetryAndToken, (err) => Promise.reject(err));

// ─── Response Interceptor: Latency Calculation & 401 Refresh ──
const handleResponseTelemetry = (response) => {
  if (response.config?.metadata?.startTime) {
    response.latencyMs = Date.now() - response.config.metadata.startTime;
  } else {
    response.latencyMs = 0;
  }
  return response;
};

const handleAuthErrorWithRefresh = async (error, clientInstance) => {
  const originalRequest = error.config;

  if (error.response && error.response.status === 401 && !originalRequest?._retry) {
    const currentPath = window.location.pathname;

    // Don't loop refresh on public auth pages
    if (currentPath === '/login' || currentPath === '/register') {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(clientInstance(originalRequest));
          },
          reject
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const res = await axios.post(`${AUTH_BASE_URL}/refresh`, { refreshToken });
      const newToken = res.data.token;
      const newRefresh = res.data.refreshToken;

      localStorage.setItem('token', newToken);
      if (newRefresh) {
        localStorage.setItem('refreshToken', newRefresh);
      }

      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return clientInstance(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
};

// Apply response interceptors to all clients
authClient.interceptors.response.use(
  handleResponseTelemetry,
  (err) => handleAuthErrorWithRefresh(err, authClient)
);

profileClient.interceptors.response.use(
  handleResponseTelemetry,
  (err) => handleAuthErrorWithRefresh(err, profileClient)
);

orchestratorClient.interceptors.response.use(
  handleResponseTelemetry,
  (err) => handleAuthErrorWithRefresh(err, orchestratorClient)
);

export default {
  authClient,
  profileClient,
  orchestratorClient
};
