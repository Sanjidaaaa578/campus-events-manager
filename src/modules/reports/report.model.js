const { getQuery, allQuery } = require('../../config/database');

class ReportModel {
  /**
   * 1. Total events and registrations summary
   */
  static async getOverviewSummary(db) {
    const totalEventsRow = await getQuery(db, 'SELECT COUNT(*) as total_events FROM events');
    const approvedEventsRow = await getQuery(
      db,
      "SELECT COUNT(*) as approved_events FROM events WHERE status = 'Approved'"
    );
    const totalRegistrationsRow = await getQuery(
      db,
      "SELECT COUNT(*) as total_registrations FROM registrations WHERE status = 'Registered'"
    );
    const totalWaitlistedRow = await getQuery(
      db,
      "SELECT COUNT(*) as total_waitlisted FROM registrations WHERE status = 'Waitlisted'"
    );
    const totalCancelledRow = await getQuery(
      db,
      "SELECT COUNT(*) as total_cancelled FROM registrations WHERE status = 'Cancelled'"
    );

    return {
      totalEvents: totalEventsRow ? totalEventsRow.total_events : 0,
      approvedEvents: approvedEventsRow ? approvedEventsRow.approved_events : 0,
      totalRegistrations: totalRegistrationsRow ? totalRegistrationsRow.total_registrations : 0,
      totalWaitlisted: totalWaitlistedRow ? totalWaitlistedRow.total_waitlisted : 0,
      totalCancelled: totalCancelledRow ? totalCancelledRow.total_cancelled : 0
    };
  }

  /**
   * 2. Most popular events based on active registration counts
   */
  static async getPopularEvents(db, limit = 5) {
    const parsedLimit = parseInt(limit, 10) || 5;
    return allQuery(
      db,
      `SELECT e.id as event_id, e.title, e.category, e.date, e.venue, e.capacity,
              u.name as organizer_name,
              COUNT(r.id) as registration_count
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'Registered'
       JOIN users u ON e.organizer_id = u.id
       GROUP BY e.id
       ORDER BY registration_count DESC, e.title ASC
       LIMIT ?`,
      [parsedLimit]
    );
  }

  /**
   * 3. Attendance per event (registered vs capacity utilization)
   */
  static async getAttendancePerEvent(db) {
    return allQuery(
      db,
      `SELECT e.id as event_id, e.title, e.category, e.date, e.capacity, e.status as event_status,
              COUNT(CASE WHEN r.status = 'Registered' THEN 1 END) as registered_count,
              COUNT(CASE WHEN r.status = 'Waitlisted' THEN 1 END) as waitlisted_count,
              ROUND((CAST(COUNT(CASE WHEN r.status = 'Registered' THEN 1 END) AS FLOAT) / e.capacity) * 100, 1) as occupancy_rate
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY e.id
       ORDER BY registered_count DESC, e.date ASC`
    );
  }

  /**
   * 4. Events count and registration breakdown per category
   */
  static async getEventsPerCategory(db) {
    return allQuery(
      db,
      `SELECT e.category,
              COUNT(DISTINCT e.id) as event_count,
              COUNT(CASE WHEN r.status = 'Registered' THEN 1 END) as total_registrations
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY e.category
       ORDER BY event_count DESC, e.category ASC`
    );
  }
}

module.exports = ReportModel;
