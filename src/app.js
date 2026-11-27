const express = require('express');
const path = require('path');
const createAuthRoutes = require('./modules/users/auth.routes');
const createEventRoutes = require('./modules/events/event.routes');
const createRegistrationRoutes = require('./modules/registrations/registration.routes');
const createNotificationRoutes = require('./modules/notifications/notification.routes');
const createReportRoutes = require('./modules/reports/report.routes');
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

  // Disable caching on all API routes so data updates immediately
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

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

  // Event routes
  const eventRoutes = createEventRoutes(getDb);
  app.use('/api/events', eventRoutes);

  // Registration routes
  const registrationRoutes = createRegistrationRoutes(getDb);
  app.use('/api/events', registrationRoutes);
  app.use('/api/registrations', registrationRoutes);

  // Notification routes
  const notificationRoutes = createNotificationRoutes(getDb);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/events', notificationRoutes);

  // Admin Reports routes
  const reportRoutes = createReportRoutes(getDb);
  app.use('/api/reports', reportRoutes);

  // 404 handler for unknown API routes
  app.use('/api', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist`
    });
  });

  // 404 handler for unknown static web pages
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
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
