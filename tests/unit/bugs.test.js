const request = require('supertest');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const EventModel = require('../../src/modules/events/event.model');
const RegistrationModel = require('../../src/modules/registrations/registration.model');
const { generateToken } = require('../../src/modules/users/auth.middleware');

describe('Bug Reposition & Regression Tests', () => {
  let db;
  let app;
  let organizer;
  let organizerToken;
  let student1, student2;
  let student1Token, student2Token;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
    app = createApp(db);

    organizer = await UserModel.create(db, {
      name: 'Organizer Fixes',
      email: 'org_fixes@campus.edu',
      password: 'password123',
      role: 'Organizer'
    });
    organizerToken = generateToken(organizer);

    student1 = await UserModel.create(db, {
      name: 'Student Fixes 1',
      email: 'student_fixes1@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    student1Token = generateToken(student1);

    student2 = await UserModel.create(db, {
      name: 'Student Fixes 2',
      email: 'student_fixes2@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    student2Token = generateToken(student2);

    // Create events with distinct dates
    const ev1 = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Dec Mid Event',
      date: '2026-12-15',
      time: '10:00',
      venue: 'Room 101',
      capacity: 1,
      category: 'Tech'
    });
    await EventModel.updateStatus(db, ev1.id, 'Approved');

    const ev2 = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Dec Late Event',
      date: '2026-12-28',
      time: '10:00',
      venue: 'Room 102',
      capacity: 1,
      category: 'Tech'
    });
    await EventModel.updateStatus(db, ev2.id, 'Approved');

    // Register student 1 (registered) and student 2 (waitlisted)
    await RegistrationModel.register(db, { eventId: ev1.id, studentId: student1.id });
    await RegistrationModel.register(db, { eventId: ev1.id, studentId: student2.id });
  });

  afterAll((done) => {
    if (db) db.close(done);
    else done();
  });

  test('Bug 1: Date range filter (startDate & endDate) and pagination (page & limit)', async () => {
    // Should filter events between 2026-12-01 and 2026-12-20
    const res = await request(app).get('/api/events?startDate=2026-12-01&endDate=2026-12-20');
    expect(res.status).toBe(200);
    expect(res.body.events.length).toBe(1);
    expect(res.body.events[0].title).toBe('Dec Mid Event');

    // Should support pagination limit and page
    const pageRes = await request(app).get('/api/events?limit=1&page=1');
    expect(pageRes.status).toBe(200);
    expect(pageRes.body.events.length).toBe(1);
    expect(pageRes.body).toHaveProperty('total');
    expect(pageRes.body).toHaveProperty('page', 1);
  });

  test('Bug 2: Waitlist position is calculated for waitlisted students in my-events', async () => {
    const res = await request(app)
      .get('/api/registrations/my-events')
      .set('Authorization', `Bearer ${student2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBe(1);
    expect(res.body.events[0].registration_status).toBe('Waitlisted');
    expect(res.body.events[0]).toHaveProperty('waitlist_position', 1);
  });
});
