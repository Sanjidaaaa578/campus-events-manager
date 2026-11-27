const express = require('express');
const path = require('path');

const app = express();

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Campus Events Manager API is operational',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred'
  });
});

module.exports = app;
