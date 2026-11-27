const { runQuery, getQuery, allQuery } = require('../../config/database');
const { EventQueryContext } = require('../../patterns/event.strategy');

class EventModel {
  /**
   * Creates a new event. Defaults status to 'Pending' for Admin review.
   */
  static async create(db, { organizerId, title, description, date, time, venue, capacity, category }) {
    if (!organizerId || !title || !date || !time || !venue || !capacity || !category) {
      const error = new Error('All required fields (title, date, time, venue, capacity, category) must be provided');
      error.status = 400;
      throw error;
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      const error = new Error('Capacity must be a positive integer greater than zero');
      error.status = 400;
      throw error;
    }

    const result = await runQuery(
      db,
      `INSERT INTO events (organizer_id, title, description, date, time, venue, capacity, category, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [organizerId, title.trim(), description ? description.trim() : '', date, time, venue.trim(), parsedCapacity, category.trim()]
    );

    return this.findById(db, result.lastID);
  }

  /**
   * Finds an event by ID.
   */
  static async findById(db, id) {
    const row = await getQuery(
      db,
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'Registered') as registered_count,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'Waitlisted') as waitlisted_count
       FROM events e 
       JOIN users u ON e.organizer_id = u.id 
       WHERE e.id = ?`,
      [id]
    );
    return row || null;
  }

  /**
   * Finds all events with optional keyword search, category, date, date range (startDate, endDate),
   * Strategy Pattern sorting, and optional pagination (page, limit).
   */
  static async findAll(db, { keyword, category, date, startDate, endDate, status, organizerId, sortBy, page, limit } = {}) {
    let baseSql = `
      FROM events e 
      JOIN users u ON e.organizer_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      baseSql += ' AND e.status = ?';
      params.push(status);
    }

    if (organizerId) {
      baseSql += ' AND e.organizer_id = ?';
      params.push(organizerId);
    }

    if (category) {
      baseSql += ' AND LOWER(e.category) = LOWER(?)';
      params.push(category.trim());
    }

    if (date) {
      baseSql += ' AND e.date = ?';
      params.push(date.trim());
    }

    if (startDate) {
      baseSql += ' AND e.date >= ?';
      params.push(startDate.trim());
    }

    if (endDate) {
      baseSql += ' AND e.date <= ?';
      params.push(endDate.trim());
    }

    if (keyword) {
      baseSql += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)';
      const term = `%${keyword.trim()}%`;
      params.push(term, term, term);
    }

    // Total count query for pagination
    const countRow = await getQuery(db, `SELECT COUNT(*) as total ${baseSql}`, params);
    const total = countRow ? countRow.total : 0;

    let sql = `
      SELECT e.*, u.name as organizer_name, u.email as organizer_email,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'Registered') as registered_count,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'Waitlisted') as waitlisted_count
      ${baseSql}
    `;

    // Apply Strategy Pattern for sorting order
    const strategy = EventQueryContext.resolveStrategy(sortBy);
    const context = new EventQueryContext(strategy);
    sql += ` ORDER BY ${context.getOrderByClause()}`;

    // Pagination
    const queryParams = [...params];
    if (limit !== undefined && limit !== null) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const offset = (parsedPage - 1) * parsedLimit;
        sql += ' LIMIT ? OFFSET ?';
        queryParams.push(parsedLimit, offset);
      }
    }

    const events = await allQuery(db, sql, queryParams);
    return { events, total };
  }

  /**
   * Updates an event.
   */
  static async update(db, id, { title, description, date, time, venue, capacity, category }) {
    const event = await this.findById(db, id);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    let parsedCapacity = event.capacity;
    if (capacity !== undefined) {
      parsedCapacity = parseInt(capacity, 10);
      if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
        const error = new Error('Capacity must be a positive integer');
        error.status = 400;
        throw error;
      }
    }

    await runQuery(
      db,
      `UPDATE events 
       SET title = ?, description = ?, date = ?, time = ?, venue = ?, capacity = ?, category = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : event.title,
        description !== undefined ? description.trim() : event.description,
        date !== undefined ? date : event.date,
        time !== undefined ? time : event.time,
        venue !== undefined ? venue.trim() : event.venue,
        parsedCapacity,
        category !== undefined ? category.trim() : event.category,
        id
      ]
    );

    return this.findById(db, id);
  }

  /**
   * Updates event status.
   */
  static async updateStatus(db, id, status) {
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const event = await this.findById(db, id);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    await runQuery(
      db,
      'UPDATE events SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    return this.findById(db, id);
  }

  /**
   * Deletes an event.
   */
  static async delete(db, id) {
    const event = await this.findById(db, id);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    await runQuery(db, 'DELETE FROM events WHERE id = ?', [id]);
    return { success: true, message: 'Event deleted successfully' };
  }
}

module.exports = EventModel;
