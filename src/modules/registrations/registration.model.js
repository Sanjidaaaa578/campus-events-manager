const { runQuery, getQuery, allQuery } = require('../../config/database');

class RegistrationModel {
  /**
   * Registers a student for an event.
   * If capacity is reached, automatically waitlists the student.
   */
  static async register(db, { eventId, studentId }) {
    // 1. Check event existence and status
    const event = await getQuery(db, 'SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    if (event.status !== 'Approved') {
      const error = new Error('Cannot register for an event that is not approved');
      error.status = 400;
      throw error;
    }

    // 2. Check existing registration
    const existing = await getQuery(
      db,
      'SELECT * FROM registrations WHERE event_id = ? AND student_id = ?',
      [eventId, studentId]
    );

    if (existing) {
      if (existing.status === 'Registered') {
        const error = new Error('You are already registered for this event');
        error.status = 409;
        throw error;
      }
      if (existing.status === 'Waitlisted') {
        const error = new Error('You are already on the waiting list for this event');
        error.status = 409;
        throw error;
      }
    }

    // 3. Check current registered count
    const registeredCountResult = await getQuery(
      db,
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = 'Registered'",
      [eventId]
    );
    const registeredCount = registeredCountResult ? registeredCountResult.count : 0;

    // Determine status: 'Registered' if under capacity, else 'Waitlisted'
    const status = registeredCount < event.capacity ? 'Registered' : 'Waitlisted';

    let result;
    if (existing && existing.status === 'Cancelled') {
      // Re-register cancelled entry
      await runQuery(
        db,
        'UPDATE registrations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, existing.id]
      );
      result = { lastID: existing.id };
    } else {
      result = await runQuery(
        db,
        'INSERT INTO registrations (event_id, student_id, status) VALUES (?, ?, ?)',
        [eventId, studentId, status]
      );
    }

    return this.findById(db, result.lastID);
  }

  /**
   * Finds registration by ID.
   */
  static async findById(db, id) {
    const row = await getQuery(
      db,
      `SELECT r.*, e.title as event_title, e.date as event_date, e.time as event_time, e.venue as event_venue,
              u.name as student_name, u.email as student_email
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN users u ON r.student_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return row || null;
  }

  /**
   * Cancels a student registration.
   * If a registered spot opens up and there is a waitlist, promotes the first waitlisted student.
   */
  static async cancel(db, { eventId, studentId }) {
    const registration = await getQuery(
      db,
      'SELECT * FROM registrations WHERE event_id = ? AND student_id = ?',
      [eventId, studentId]
    );

    if (!registration || registration.status === 'Cancelled') {
      const error = new Error('No active registration found for this event');
      error.status = 404;
      throw error;
    }

    const wasRegistered = registration.status === 'Registered';

    // Update status to Cancelled
    await runQuery(
      db,
      "UPDATE registrations SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [registration.id]
    );

    let promotedStudent = null;

    // If an active registration was cancelled, promote the first waitlisted student
    if (wasRegistered) {
      const nextWaitlisted = await getQuery(
        db,
        `SELECT * FROM registrations 
         WHERE event_id = ? AND status = 'Waitlisted' 
         ORDER BY registered_at ASC LIMIT 1`,
        [eventId]
      );

      if (nextWaitlisted) {
        await runQuery(
          db,
          "UPDATE registrations SET status = 'Registered', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [nextWaitlisted.id]
        );
        promotedStudent = await this.findById(db, nextWaitlisted.id);
      }
    }

    return {
      success: true,
      message: 'Registration cancelled successfully',
      promotedStudent
    };
  }

  /**
   * Gets all registered/waitlisted events for a student.
   */
  static async getStudentRegistrations(db, studentId) {
    return allQuery(
      db,
      `SELECT r.id as registration_id, r.status as registration_status, r.registered_at,
              e.id as event_id, e.title, e.description, e.date, e.time, e.venue, e.category, e.capacity
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.student_id = ? AND r.status != 'Cancelled'
       ORDER BY e.date ASC, e.time ASC`,
      [studentId]
    );
  }

  /**
   * Gets attendee list for an event (Organizer or Admin view).
   */
  static async getEventAttendees(db, eventId) {
    return allQuery(
      db,
      `SELECT r.id as registration_id, r.status, r.registered_at,
              u.id as student_id, u.name as student_name, u.email as student_email, u.department
       FROM registrations r
       JOIN users u ON r.student_id = u.id
       WHERE r.event_id = ? AND r.status != 'Cancelled'
       ORDER BY r.status ASC, r.registered_at ASC`,
      [eventId]
    );
  }
}

module.exports = RegistrationModel;
