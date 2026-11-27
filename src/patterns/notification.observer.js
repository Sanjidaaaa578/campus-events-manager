const NotificationModel = require('../modules/notifications/notification.model');

/**
 * Base Observer Interface
 */
class NotificationObserver {
  async update(eventType, data, db) {
    throw new Error('update() must be implemented by concrete observer');
  }
}

/**
 * Concrete Observer: Registration Observer
 * Handles student registration confirmations and waitlist status notices.
 */
class RegistrationObserver extends NotificationObserver {
  async update(eventType, data, db) {
    if (eventType === 'REGISTRATION_CONFIRMED') {
      const { studentId, eventTitle, eventDate, eventVenue } = data;
      await NotificationModel.create(db, {
        userId: studentId,
        title: `Registration Confirmed: ${eventTitle}`,
        message: `Your registration for "${eventTitle}" on ${eventDate} at ${eventVenue} has been confirmed.`
      });
    } else if (eventType === 'REGISTRATION_WAITLISTED') {
      const { studentId, eventTitle } = data;
      await NotificationModel.create(db, {
        userId: studentId,
        title: `Waitlist Confirmation: ${eventTitle}`,
        message: `You are currently on the waiting list for "${eventTitle}". We will notify you if a spot opens up.`
      });
    } else if (eventType === 'REGISTRATION_CANCELLED') {
      const { studentId, eventTitle } = data;
      await NotificationModel.create(db, {
        userId: studentId,
        title: `Registration Cancelled: ${eventTitle}`,
        message: `Your registration for "${eventTitle}" has been cancelled.`
      });
    }
  }
}

/**
 * Concrete Observer: Waitlist Promotion Observer
 * Handles notifying students who are automatically moved from waitlist to confirmed.
 */
class WaitlistPromotionObserver extends NotificationObserver {
  async update(eventType, data, db) {
    if (eventType === 'WAITLIST_PROMOTED') {
      const { studentId, eventTitle } = data;
      await NotificationModel.create(db, {
        userId: studentId,
        title: `Spot Available: ${eventTitle}`,
        message: `Great news! A spot opened up and your registration for "${eventTitle}" is now confirmed.`
      });
    }
  }
}

/**
 * Concrete Observer: Event Broadcast Observer
 * Handles mass attendee alerts when events are updated or cancelled.
 */
class EventBroadcastObserver extends NotificationObserver {
  async update(eventType, data, db) {
    if (eventType === 'EVENT_UPDATED') {
      const { attendeeIds, eventTitle, date, time, venue } = data;
      await NotificationModel.broadcastToUsers(db, attendeeIds, {
        title: `Event Updated: ${eventTitle}`,
        message: `The event "${eventTitle}" has been updated. Date: ${date}, Time: ${time}, Venue: ${venue}.`
      });
    } else if (eventType === 'EVENT_CANCELLED') {
      const { attendeeIds, eventTitle, date } = data;
      await NotificationModel.broadcastToUsers(db, attendeeIds, {
        title: `Event Cancelled: ${eventTitle}`,
        message: `The event "${eventTitle}" originally scheduled for ${date} has been cancelled.`
      });
    }
  }
}

/**
 * Subject: NotificationSubject
 * Maintains a list of observers and notifies them of events.
 */
class NotificationSubject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  async notify(eventType, data, db) {
    for (const observer of this.observers) {
      await observer.update(eventType, data, db);
    }
  }
}

// Default singleton subject preconfigured with core observers
const defaultNotificationSubject = new NotificationSubject();
defaultNotificationSubject.attach(new RegistrationObserver());
defaultNotificationSubject.attach(new WaitlistPromotionObserver());
defaultNotificationSubject.attach(new EventBroadcastObserver());

module.exports = {
  NotificationObserver,
  RegistrationObserver,
  WaitlistPromotionObserver,
  EventBroadcastObserver,
  NotificationSubject,
  defaultNotificationSubject
};
