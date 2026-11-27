const express = require('express');
const RegistrationModel = require('./registration.model');
const EventModel = require('../events/event.model');
const NotificationModel = require('../notifications/notification.model');
const { authenticateToken, authorizeRoles } = require('../users/auth.middleware');

function createRegistrationRoutes(getDb) {
  const router = express.Router();
  const resolveDb = async () => (typeof getDb === 'function' ? await getDb() : getDb);

  /**
   * POST /api/events/:id/register
   * Student registers for an event and receives notification.
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

      // Send in-app notification to student
      await NotificationModel.create(db, {
        userId: studentId,
        title: isWaitlisted
          ? `Waitlist Confirmation: ${registration.event_title}`
          : `Registration Confirmed: ${registration.event_title}`,
        message: isWaitlisted
          ? `You are currently on the waiting list for "${registration.event_title}". We will notify you if a spot opens up.`
          : `Your registration for "${registration.event_title}" on ${registration.event_date} at ${registration.event_venue} has been confirmed.`
      });

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
   * Student cancels registration and receives confirmation notification.
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

      // Send cancellation confirmation notification to the student
      await NotificationModel.create(db, {
        userId: studentId,
        title: `Registration Cancelled: ${event ? event.title : 'Event'}`,
        message: `Your registration for "${event ? event.title : 'the event'}" has been cancelled.`
      });

      // If a waitlisted student was promoted, notify them
      if (result.promotedStudent) {
        await NotificationModel.create(db, {
          userId: result.promotedStudent.student_id,
          title: `Spot Available: ${result.promotedStudent.event_title}`,
          message: `Great news! A spot opened up and your registration for "${result.promotedStudent.event_title}" is now confirmed.`
        });
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
