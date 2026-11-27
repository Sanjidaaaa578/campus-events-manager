const express = require('express');
const ReportModel = require('./report.model');
const { authenticateToken, authorizeRoles } = require('../users/auth.middleware');

function createReportRoutes(getDb) {
  const router = express.Router();
  const resolveDb = async () => (typeof getDb === 'function' ? await getDb() : getDb);

  // All reports require Admin role
  router.use(authenticateToken, authorizeRoles('Admin'));

  /**
   * GET /api/reports/summary
   * Total events and registrations overview
   */
  router.get('/summary', async (req, res, next) => {
    try {
      const db = await resolveDb();
      const summary = await ReportModel.getOverviewSummary(db);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/reports/popular-events
   * Most popular events ranked by registration count
   */
  router.get('/popular-events', async (req, res, next) => {
    try {
      const db = await resolveDb();
      const limit = req.query.limit || 5;
      const popularEvents = await ReportModel.getPopularEvents(db, limit);
      res.status(200).json({ popularEvents });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/reports/attendance
   * Attendance and occupancy metrics per event
   */
  router.get('/attendance', async (req, res, next) => {
    try {
      const db = await resolveDb();
      const attendance = await ReportModel.getAttendancePerEvent(db);
      res.status(200).json({ attendance });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/reports/categories
   * Distribution of events and registrations per category
   */
  router.get('/categories', async (req, res, next) => {
    try {
      const db = await resolveDb();
      const categories = await ReportModel.getEventsPerCategory(db);
      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createReportRoutes;
