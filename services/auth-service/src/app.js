/**
 * @file app.js
 * @description Express application factory configuring security headers, CORS policies,
 * body parsers, route handlers, health probes, and centralized error interception.
 * @author Md Hussain Ansari (Member 1)
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, AppError } = require('./middleware/errorHandler');
const { CLIENT_ORIGIN } = require('./config/env');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Liveness Probe: Returns HTTP 200 if server process is running.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'auth-service'
  });
});

/**
 * Readiness Probe: Checks whether MongoDB connection is ready to accept traffic.
 */
app.get('/ready', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1; // 1 = connected
  if (isDbReady) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      service: 'auth-service',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({
    status: 'unready',
    database: 'disconnected',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Mount Authentication Routes
app.use('/api/v1/auth', authRoutes);

// Catch-all handler for unmapped routes
app.use('*', (req, res, next) => {
  next(new AppError('NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`, 404));
});

// Centralized error interceptor
app.use(errorHandler);

module.exports = app;
