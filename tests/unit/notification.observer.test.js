const {
  NotificationSubject,
  NotificationObserver,
  RegistrationObserver,
  WaitlistPromotionObserver,
  EventBroadcastObserver
} = require('../../src/patterns/notification.observer');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const NotificationModel = require('../../src/modules/notifications/notification.model');

describe('Design Pattern: Observer (NotificationSubject & Observers)', () => {
  let db;
  let testUser;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);

    testUser = await UserModel.create(db, {
      name: 'Observer Tester',
      email: 'obs@campus.edu',
      password: 'password123',
      role: 'Student'
    });
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  test('NotificationSubject attaches and detaches observers correctly', () => {
    const subject = new NotificationSubject();
    const observer = new RegistrationObserver();

    subject.attach(observer);
    expect(subject.observers).toContain(observer);

    subject.detach(observer);
    expect(subject.observers).not.toContain(observer);
  });

  test('RegistrationObserver creates notification on REGISTRATION_CONFIRMED', async () => {
    const subject = new NotificationSubject();
    subject.attach(new RegistrationObserver());

    await subject.notify(
      'REGISTRATION_CONFIRMED',
      {
        studentId: testUser.id,
        eventTitle: 'Observer Hackathon',
        eventDate: '2026-12-30',
        eventVenue: 'Hall A'
      },
      db
    );

    const notifications = await NotificationModel.findByUserId(db, testUser.id);
    expect(notifications.length).toBeGreaterThanOrEqual(1);
    expect(notifications[0].title).toBe('Registration Confirmed: Observer Hackathon');
    expect(notifications[0].message).toContain('Hall A');
  });

  test('WaitlistPromotionObserver creates notification on WAITLIST_PROMOTED', async () => {
    const subject = new NotificationSubject();
    subject.attach(new WaitlistPromotionObserver());

    await subject.notify(
      'WAITLIST_PROMOTED',
      {
        studentId: testUser.id,
        eventTitle: 'Observer Workshop'
      },
      db
    );

    const notifications = await NotificationModel.findByUserId(db, testUser.id);
    const promoNotif = notifications.find((n) => n.title.includes('Spot Available'));
    expect(promoNotif).toBeDefined();
    expect(promoNotif.message).toContain('A spot opened up');
  });

  test('EventBroadcastObserver creates notification on EVENT_UPDATED', async () => {
    const subject = new NotificationSubject();
    subject.attach(new EventBroadcastObserver());

    await subject.notify(
      'EVENT_UPDATED',
      {
        attendeeIds: [testUser.id],
        eventTitle: 'Observer Tech Talk',
        date: '2026-12-31',
        time: '14:00',
        venue: 'Room 200'
      },
      db
    );

    const notifications = await NotificationModel.findByUserId(db, testUser.id);
    const updateNotif = notifications.find((n) => n.title.includes('Event Updated'));
    expect(updateNotif).toBeDefined();
    expect(updateNotif.message).toContain('Room 200');
  });
});
