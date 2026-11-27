const express = require('express');
const path = require('path');
const createAuthRoutes = require('./modules/users/auth.routes');
const { connectDatabase } = require('./config/database');

function createApp(dbInstance) {
  const app = express();

  // Lazy or passed database instance
  let db = dbInstance;
  const getDb = async () => {
    if (!db) {
      db = await connectDatabase();
    }
    return db;
  };

  // Body parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, '../public')));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Campus Events Manager API is operational',
      timestamp: new Date().toISOString()
    });
  });

  // Auth & User routes
  const authRoutes = createAuthRoutes(getDb);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', authRoutes);

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
      error: err.name || 'Error',
      message: err.message || 'An unexpected error occurred'
    });
  });

  return app;
}

// Default app instance for server & direct usage
const defaultApp = createApp();

module.exports = defaultApp;
module.exports.createApp = createApp;
