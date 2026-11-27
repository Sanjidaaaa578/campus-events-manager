const express = require('express');
const RegistrationModel = require('./registration.model');
const EventModel = require('../events/event.model');
const { defaultNotificationSubject } = require('../../patterns/notification.observer');
const { authenticateToken, authorizeRoles } = require('../users/auth.middleware');

function createRegistrationRoutes(getDb) {
  const router = express.Router();
  const resolveDb = async () => (typeof getDb === 'function' ? await getDb() : getDb);

  /**
   * POST /api/events/:id/register
   * Student registers for an event and triggers notification via Observer Pattern.
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

      const isWaitlisted = registration.status === 'Waitlisted';
      const message = isWaitlisted
        ? 'Event capacity reached. You have been added to the waiting list.'
        : 'Registration confirmed successfully.';

      // Notify via Observer Pattern
      await defaultNotificationSubject.notify(
        isWaitlisted ? 'REGISTRATION_WAITLISTED' : 'REGISTRATION_CONFIRMED',
        {
          studentId,
          eventTitle: registration.event_title,
          eventDate: registration.event_date,
          eventVenue: registration.event_venue
        },
        db
      );

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
   * Student cancels registration and triggers observer notifications.
   */
  router.delete('/:id/register', authenticateToken, authorizeRoles('Student', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const eventId = req.params.id;
      const studentId = req.user.id;
      const event = await EventModel.findById(db, eventId);

      const result = await RegistrationModel.cancel(db, {
        eventId,
        studentId
      });

      // Notify cancellation via Observer Pattern
      await defaultNotificationSubject.notify(
        'REGISTRATION_CANCELLED',
        {
          studentId,
          eventTitle: event ? event.title : 'Event'
        },
        db
      );

      // If a waitlisted student was promoted, notify them via Observer Pattern
      if (result.promotedStudent) {
        await defaultNotificationSubject.notify(
          'WAITLIST_PROMOTED',
          {
            studentId: result.promotedStudent.student_id,
            eventTitle: result.promotedStudent.event_title
          },
          db
        );
      }

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
   * Organizer views attendee and waiting list for their event.
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
