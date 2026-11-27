const express = require('express');
const EventModel = require('./event.model');
const RegistrationModel = require('../registrations/registration.model');
const { defaultNotificationSubject } = require('../../patterns/notification.observer');
const { authenticateToken, authorizeRoles } = require('../users/auth.middleware');

function createEventRoutes(getDb) {
  const router = express.Router();
  const resolveDb = async () => (typeof getDb === 'function' ? await getDb() : getDb);

  /**
   * GET /api/events
   * Browse events with keyword search, category, date, date range, pagination, and sortBy strategy.
   */
  router.get('/', async (req, res, next) => {
    try {
      const db = await resolveDb();
      const { keyword, category, date, startDate, endDate, status, organizerId, sortBy, page, limit } = req.query;
      const eventStatus = status || 'Approved';

      const { events, total } = await EventModel.findAll(db, {
        keyword,
        category,
        date,
        startDate,
        endDate,
        status: eventStatus,
        organizerId,
        sortBy,
        page,
        limit
      });

      const parsedLimit = limit !== undefined && limit !== null ? parseInt(limit, 10) : total;
      const parsedPage = page ? parseInt(page, 10) : 1;
      const totalPages = parsedLimit > 0 ? Math.ceil(total / parsedLimit) : 1;

      res.status(200).json({
        events,
        total,
        page: parsedPage,
        limit: parsedLimit,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/events/:id
   * Get single event details
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const db = await resolveDb();
      const event = await EventModel.findById(db, req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
      }
      res.status(200).json({ event });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/events
   * Organizer creates a new event.
   */
  router.post('/', authenticateToken, authorizeRoles('Organizer', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const { title, description, date, time, venue, capacity, category } = req.body;

      const newEvent = await EventModel.create(db, {
        organizerId: req.user.id,
        title,
        description,
        date,
        time,
        venue,
        capacity,
        category
      });

      res.status(201).json({
        message: 'Event created and submitted for review',
        event: newEvent
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/events/:id
   * Organizer edits event details and notifies registered students via Observer Pattern.
   */
  router.put('/:id', authenticateToken, authorizeRoles('Organizer', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const event = await EventModel.findById(db, req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
      }

      if (req.user.role === 'Organizer' && event.organizer_id !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only edit events you have organized'
        });
      }

      const updatedEvent = await EventModel.update(db, req.params.id, req.body);

      // Notify registered students using Observer Pattern
      const attendees = await RegistrationModel.getEventAttendees(db, req.params.id);
      const studentIds = attendees.filter((a) => a.status === 'Registered').map((a) => a.student_id);

      await defaultNotificationSubject.notify(
        'EVENT_UPDATED',
        {
          attendeeIds: studentIds,
          eventTitle: updatedEvent.title,
          date: updatedEvent.date,
          time: updatedEvent.time,
          venue: updatedEvent.venue
        },
        db
      );

      res.status(200).json({
        message: 'Event updated successfully',
        event: updatedEvent
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/events/:id
   * Organizer cancels/deletes event and notifies registered students via Observer Pattern.
   */
  router.delete('/:id', authenticateToken, authorizeRoles('Organizer', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const event = await EventModel.findById(db, req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
      }

      if (req.user.role === 'Organizer' && event.organizer_id !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete events you have organized'
        });
      }

      // Notify attendees before deletion using Observer Pattern
      const attendees = await RegistrationModel.getEventAttendees(db, req.params.id);
      const studentIds = attendees.map((a) => a.student_id);

      await defaultNotificationSubject.notify(
        'EVENT_CANCELLED',
        {
          attendeeIds: studentIds,
          eventTitle: event.title,
          date: event.date
        },
        db
      );

      const result = await EventModel.delete(db, req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  /**
   * PATCH /api/events/:id/status
   * Admin approves or rejects submitted events.
   */
  router.patch('/:id/status', authenticateToken, authorizeRoles('Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const { status } = req.body;

      if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Admin status update must be either Approved or Rejected'
        });
      }

      const updatedEvent = await EventModel.updateStatus(db, req.params.id, status);
      res.status(200).json({
        message: `Event has been ${status.toLowerCase()}`,
        event: updatedEvent
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createEventRoutes;
