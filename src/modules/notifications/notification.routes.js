const express = require('express');
const NotificationModel = require('./notification.model');
const EventModel = require('../events/event.model');
const { authenticateToken, authorizeRoles } = require('../users/auth.middleware');

function createNotificationRoutes(getDb) {
  const router = express.Router();
  const resolveDb = async () => (typeof getDb === 'function' ? await getDb() : getDb);

  /**
   * GET /api/notifications
   * View all notifications for the authenticated user.
   */
  router.get('/', authenticateToken, async (req, res, next) => {
    try {
      const db = await resolveDb();
      const notifications = await NotificationModel.findByUserId(db, req.user.id);
      res.status(200).json({ notifications });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read.
   */
  router.patch('/:id/read', authenticateToken, async (req, res, next) => {
    try {
      const db = await resolveDb();
      const updated = await NotificationModel.markAsRead(db, req.params.id, req.user.id);
      res.status(200).json({
        message: 'Notification marked as read',
        notification: updated
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/events/:id/remind
   * Organizer or Admin triggers a reminder to all registered students.
   */
  router.post('/:id/remind', authenticateToken, authorizeRoles('Organizer', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const eventId = req.params.id;
      const event = await EventModel.findById(db, eventId);

      if (!event) {
        return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
      }

      if (req.user.role === 'Organizer' && event.organizer_id !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only send reminders for your own events'
        });
      }

      const reminders = await NotificationModel.sendEventReminder(db, eventId);
      res.status(200).json({
        message: `Reminder notifications sent to ${reminders.length} registered students`,
        count: reminders.length
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createNotificationRoutes;
