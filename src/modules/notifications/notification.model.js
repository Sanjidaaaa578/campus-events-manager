const { runQuery, getQuery, allQuery } = require('../../config/database');

class NotificationModel {
  /**
   * Creates a notification for a user.
   */
  static async create(db, { userId, title, message }) {
    const result = await runQuery(
      db,
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userId, title.trim(), message.trim()]
    );
    return this.findById(db, result.lastID);
  }

  /**
   * Finds a notification by ID.
   */
  static async findById(db, id) {
    const row = await getQuery(db, 'SELECT * FROM notifications WHERE id = ?', [id]);
    return row || null;
  }

  /**
   * Finds all notifications for a specific user.
   */
  static async findByUserId(db, userId) {
    return allQuery(
      db,
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }

  /**
   * Marks a notification as read.
   */
  static async markAsRead(db, id, userId) {
    const notif = await this.findById(db, id);
    if (!notif) {
      const error = new Error('Notification not found');
      error.status = 404;
      throw error;
    }

    if (notif.user_id !== userId) {
      const error = new Error('Unauthorized access to notification');
      error.status = 403;
      throw error;
    }

    await runQuery(db, 'UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return this.findById(db, id);
  }

  /**
   * Broadcasts a notification to multiple users (e.g. all registered attendees of an event).
   */
  static async broadcastToUsers(db, userIds, { title, message }) {
    if (!userIds || userIds.length === 0) return [];
    const notifications = [];
    for (const uId of userIds) {
      const notif = await this.create(db, { userId: uId, title, message });
      notifications.push(notif);
    }
    return notifications;
  }

  /**
   * Sends event reminders to all registered students of an event.
   */
  static async sendEventReminder(db, eventId) {
    const event = await getQuery(db, 'SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    const attendees = await allQuery(
      db,
      "SELECT student_id FROM registrations WHERE event_id = ? AND status = 'Registered'",
      [eventId]
    );

    const userIds = attendees.map((a) => a.student_id);
    const title = `Event Reminder: ${event.title}`;
    const message = `Reminder: "${event.title}" will take place on ${event.date} at ${event.time} in ${event.venue}. We look forward to seeing you!`;

    return this.broadcastToUsers(db, userIds, { title, message });
  }
}

module.exports = NotificationModel;
