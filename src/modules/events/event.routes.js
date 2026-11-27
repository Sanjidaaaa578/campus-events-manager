const express = require('express');
const EventModel = require('./event.model');
const { authenticateToken, authorizeRoles } = require('../users/auth.middleware');

function createEventRoutes(getDb) {
  const router = express.Router();

  // Helper to resolve db instance
  const resolveDb = async () => (typeof getDb === 'function' ? await getDb() : getDb);

  /**
   * GET /api/events
   * Browse events with keyword search, category, and date filtering.
   * Students/Public view Approved events by default; Admins/Organizers can query other statuses.
   */
  router.get('/', async (req, res, next) => {
    try {
      const db = await resolveDb();
      const { keyword, category, date, status, organizerId } = req.query;

      // Default to Approved unless user filters or is admin/organizer
      const eventStatus = status || 'Approved';

      const events = await EventModel.findAll(db, {
        keyword,
        category,
        date,
        status: eventStatus,
        organizerId
      });

      res.status(200).json({ events });
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
   * Organizer creates a new event (submitted as 'Pending' for Admin review).
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
   * Organizer edits their own event (or Admin edits any event).
   */
  router.put('/:id', authenticateToken, authorizeRoles('Organizer', 'Admin'), async (req, res, next) => {
    try {
      const db = await resolveDb();
      const event = await EventModel.findById(db, req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'NotFound', message: 'Event not found' });
      }

      // Organizers can only edit their own events
      if (req.user.role === 'Organizer' && event.organizer_id !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only edit events you have organized'
        });
      }

      const updatedEvent = await EventModel.update(db, req.params.id, req.body);
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
   * Organizer deletes their own event (or Admin deletes any event).
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
