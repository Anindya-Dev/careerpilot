/**
 * @file app.js
 * @description Express application factory for the Profile Microservice.
 * Configures security, CORS, routes, health probes, and error handling.
 * @author Md Hussain Ansari (Member 1)
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const profileRoutes = require('./routes/profileRoutes');
const { errorHandler, AppError } = require('./middleware/errorHandler');
const { CLIENT_ORIGIN } = require('./config/env');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-key', 'x-user-id']
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * Liveness Probe: Returns HTTP 200 if server process is running.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'profile-service'
  });
});

/**
 * Readiness Probe: Checks MongoDB connectivity.
 */
app.get('/ready', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      service: 'profile-service',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({
    status: 'unready',
    database: 'disconnected',
    service: 'profile-service',
    timestamp: new Date().toISOString()
  });
});

// Mount Profile Routes
app.use('/api/v1/profile', profileRoutes);

// Catch-all handler for unmapped routes
app.use('*', (req, res, next) => {
  next(new AppError('NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`, 404));
});

// Centralized error interceptor
app.use(errorHandler);

module.exports = app;
