const express = require('express');
const RegistrationModel = require('./registration.model');
const EventModel = require('../events/event.model');
const { authenticateToken, authorizeRoles } = require('../users/auth.middleware');

function createRegistrationRoutes(getDb) {
  const router = express.Router();
  const resolveDb = async () => (typeof getDb === 'function' ? await getDb() : getDb);

  /**
   * POST /api/events/:id/register
   * Student registers for an event (or enters waiting list if full).
   */
  router.post('/:id/register', authenticateToken, authorizeRoles('Student', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const eventId = req.params.id;
      const studentId = req.user.id;

      const registration = await RegistrationModel.register(db, {
        eventId,
        studentId
      });

      const message =
        registration.status === 'Waitlisted'
          ? 'Event capacity reached. You have been added to the waiting list.'
          : 'Registration confirmed successfully.';

      res.status(201).json({
        message,
        registration
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/events/:id/register
   * Student cancels registration for an event.
   */
  router.delete('/:id/register', authenticateToken, authorizeRoles('Student', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const eventId = req.params.id;
      const studentId = req.user.id;

      const result = await RegistrationModel.cancel(db, {
        eventId,
        studentId
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/registrations/my-events
   * Student views their registered and waitlisted events.
   */
  router.get('/my-events', authenticateToken, authorizeRoles('Student', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const events = await RegistrationModel.getStudentRegistrations(db, req.user.id);
      res.status(200).json({ events });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/events/:id/attendees
   * Organizer views attendee and waiting list for their event (Admin can view any).
   */
  router.get('/:id/attendees', authenticateToken, authorizeRoles('Organizer', 'Admin'), async (req, res, next) => {
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
          message: 'You can only view attendee lists for your own events'
        });
      }

      const attendees = await RegistrationModel.getEventAttendees(db, eventId);
      res.status(200).json({
        eventId,
        eventTitle: event.title,
        capacity: event.capacity,
        totalRegistered: attendees.filter((a) => a.status === 'Registered').length,
        totalWaitlisted: attendees.filter((a) => a.status === 'Waitlisted').length,
        attendees
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createRegistrationRoutes;
