const request = require('supertest');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const EventModel = require('../../src/modules/events/event.model');
const { generateToken } = require('../../src/modules/users/auth.middleware');

describe('Module 4: Notifications Tests', () => {
  let db;
  let app;
  let organizer;
  let organizerToken;
  let student1, student2;
  let token1, token2;
  let event;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
    app = createApp(db);

    organizer = await UserModel.create(db, {
      name: 'Organizer Nina',
      email: 'nina@campus.edu',
      password: 'password123',
      role: 'Organizer'
    });
    organizerToken = generateToken(organizer);

    student1 = await UserModel.create(db, {
      name: 'Student Jack',
      email: 'jack@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    token1 = generateToken(student1);

    student2 = await UserModel.create(db, {
      name: 'Student Jill',
      email: 'jill@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    token2 = generateToken(student2);

    event = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Robotics Showcase',
      description: 'Annual robotics student exhibits',
      date: '2026-12-22',
      time: '15:00',
      venue: 'Robotics Lab',
      capacity: 5,
      category: 'Science'
    });
    await EventModel.updateStatus(db, event.id, 'Approved');
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  test('Student receives notification when registration is confirmed', async () => {
    await request(app)
      .post(`/api/events/${event.id}/register`)
      .set('Authorization', `Bearer ${token1}`);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
    expect(res.body.notifications[0].title).toContain('Registration Confirmed');
    expect(res.body.notifications[0].is_read).toBe(0);
  });

  test('Student can mark notification as read', async () => {
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token1}`);

    const notifId = listRes.body.notifications[0].id;

    const readRes = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${token1}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.notification.is_read).toBe(1);
  });

  test('Student receives notification when registration is cancelled', async () => {
    await request(app)
      .delete(`/api/events/${event.id}/register`)
      .set('Authorization', `Bearer ${token1}`);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    const cancelNotif = res.body.notifications.find((n) => n.title.includes('Cancelled'));
    expect(cancelNotif).toBeDefined();
  });

  test('Registered students receive notification when an event is updated', async () => {
    // Student 2 registers
    await request(app)
      .post(`/api/events/${event.id}/register`)
      .set('Authorization', `Bearer ${token2}`);

    // Organizer updates the event
    await request(app)
      .put(`/api/events/${event.id}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ venue: 'Main Hall Auditorium', time: '16:00' });

    // Student 2 checks notifications
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    const updateNotif = res.body.notifications.find((n) => n.title.includes('Event Updated'));
    expect(updateNotif).toBeDefined();
    expect(updateNotif.message).toContain('Main Hall Auditorium');
  });

  test('Organizer triggers event reminder before event to registered students', async () => {
    const remindRes = await request(app)
      .post(`/api/events/${event.id}/remind`)
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(remindRes.status).toBe(200);
    expect(remindRes.body.count).toBe(1); // Student 2

    // Student 2 checks notifications for reminder
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token2}`);

    const reminderNotif = res.body.notifications.find((n) => n.title.includes('Event Reminder'));
    expect(reminderNotif).toBeDefined();
    expect(reminderNotif.message).toContain('We look forward to seeing you');
  });

  test('Registered students receive notification when event is cancelled/deleted', async () => {
    await request(app)
      .delete(`/api/events/${event.id}`)
      .set('Authorization', `Bearer ${organizerToken}`);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token2}`);

    const cancelNotif = res.body.notifications.find((n) => n.title.includes('Event Cancelled'));
    expect(cancelNotif).toBeDefined();
  });
});
