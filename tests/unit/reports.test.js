const request = require('supertest');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const EventModel = require('../../src/modules/events/event.model');
const RegistrationModel = require('../../src/modules/registrations/registration.model');
const { generateToken } = require('../../src/modules/users/auth.middleware');

describe('Module 5: Admin Reports Tests', () => {
  let db;
  let app;
  let adminToken;
  let studentToken;
  let organizerToken;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
    app = createApp(db);

    // Setup Admin
    const admin = await UserModel.create(db, {
      name: 'Admin Report Officer',
      email: 'admin_rep@campus.edu',
      password: 'password123',
      role: 'Admin'
    });
    adminToken = generateToken(admin);

    // Setup Organizer
    const organizer = await UserModel.create(db, {
      name: 'Organizer Reports',
      email: 'org_rep@campus.edu',
      password: 'password123',
      role: 'Organizer'
    });
    organizerToken = generateToken(organizer);

    // Setup Students
    const studentA = await UserModel.create(db, {
      name: 'Student Alpha',
      email: 'alpha@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    const studentB = await UserModel.create(db, {
      name: 'Student Beta',
      email: 'beta@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    studentToken = generateToken(studentA);

    // Create 2 Events: Technology & Sports
    const techEvent = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'AI Symposium',
      description: 'Symposium on Modern Machine Learning',
      date: '2026-12-18',
      time: '10:00',
      venue: 'Auditorium A',
      capacity: 50,
      category: 'Technology'
    });
    await EventModel.updateStatus(db, techEvent.id, 'Approved');

    const sportsEvent = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Campus Football Championship',
      description: 'Annual inter-department football tournament',
      date: '2026-12-25',
      time: '16:00',
      venue: 'Campus Stadium',
      capacity: 100,
      category: 'Sports'
    });
    await EventModel.updateStatus(db, sportsEvent.id, 'Approved');

    // Register students
    await RegistrationModel.register(db, { eventId: techEvent.id, studentId: studentA.id });
    await RegistrationModel.register(db, { eventId: techEvent.id, studentId: studentB.id });
    await RegistrationModel.register(db, { eventId: sportsEvent.id, studentId: studentA.id });
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  test('Non-admin users cannot access reports (403 Forbidden)', async () => {
    const studentRes = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studentRes.status).toBe(403);

    const organizerRes = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${organizerToken}`);
    expect(organizerRes.status).toBe(403);
  });

  test('GET /api/reports/summary returns accurate total counts', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toHaveProperty('totalEvents', 2);
    expect(res.body.summary).toHaveProperty('approvedEvents', 2);
    expect(res.body.summary).toHaveProperty('totalRegistrations', 3);
  });

  test('GET /api/reports/popular-events ranks events by registration count', async () => {
    const res = await request(app)
      .get('/api/reports/popular-events?limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.popularEvents.length).toBe(2);
    // AI Symposium has 2 registrations, Sports has 1
    expect(res.body.popularEvents[0].title).toBe('AI Symposium');
    expect(res.body.popularEvents[0].registration_count).toBe(2);
  });

  test('GET /api/reports/attendance returns event capacity and occupancy rate', async () => {
    const res = await request(app)
      .get('/api/reports/attendance')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.attendance.length).toBe(2);
    const techReport = res.body.attendance.find((a) => a.title === 'AI Symposium');
    expect(techReport).toBeDefined();
    expect(techReport.registered_count).toBe(2);
    expect(techReport.capacity).toBe(50);
    expect(techReport.occupancy_rate).toBe(4); // (2 / 50) * 100 = 4.0%
  });

  test('GET /api/reports/categories returns breakdown per category', async () => {
    const res = await request(app)
      .get('/api/reports/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBe(2);
    const techCategory = res.body.categories.find((c) => c.category === 'Technology');
    expect(techCategory.event_count).toBe(1);
    expect(techCategory.total_registrations).toBe(2);
  });
});
