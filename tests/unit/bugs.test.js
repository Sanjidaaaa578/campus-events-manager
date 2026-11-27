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

  test('Bug 3: Seat occupancy registered_count changes immediately on register and cancel', async () => {
    const freshEvent = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Occupancy Testing Summit',
      date: '2026-12-25',
      time: '14:00',
      venue: 'Auditorium Z',
      capacity: 5,
      category: 'Tech'
    });
    await EventModel.updateStatus(db, freshEvent.id, 'Approved');

    // Initially 0 registered
    const initialRes = await request(app).get(`/api/events/${freshEvent.id}`);
    expect(initialRes.status).toBe(200);
    expect(initialRes.body.event.registered_count).toBe(0);

    // Student 1 registers
    const regRes = await request(app)
      .post(`/api/events/${freshEvent.id}/register`)
      .set('Authorization', `Bearer ${student1Token}`);
    expect(regRes.status).toBe(201);

    // Fetch event details -> registered_count must be 1
    const afterRegRes = await request(app).get(`/api/events/${freshEvent.id}`);
    expect(afterRegRes.status).toBe(200);
    expect(afterRegRes.body.event.registered_count).toBe(1);

    // Student 1 cancels
    const cancelRes = await request(app)
      .delete(`/api/events/${freshEvent.id}/register`)
      .set('Authorization', `Bearer ${student1Token}`);
    expect(cancelRes.status).toBe(200);

    // Fetch event details -> registered_count must be back to 0
    const afterCancelRes = await request(app).get(`/api/events/${freshEvent.id}`);
    expect(afterCancelRes.status).toBe(200);
    expect(afterCancelRes.body.event.registered_count).toBe(0);
  });

  test('Bug 4: Admin approval immediately adds event to browse events catalog and pagination metadata is included', async () => {
    const admin = await UserModel.create(db, {
      name: 'Admin Approval Verifier',
      email: 'admin_verifier@campus.edu',
      password: 'password123',
      role: 'Admin'
    });
    const adminToken = generateToken(admin);

    // Organizer creates a pending event
    const pendingEv = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Pending Workshop For Approval',
      date: '2026-12-30',
      time: '15:30',
      venue: 'Lab 5',
      capacity: 20,
      category: 'Workshop'
    });

    // Verify it is NOT returned in the approved events list
    const beforeApprovalRes = await request(app).get('/api/events');
    const foundBefore = beforeApprovalRes.body.events.find((e) => e.id === pendingEv.id);
    expect(foundBefore).toBeUndefined();

    // Admin approves the event
    const approveRes = await request(app)
      .patch(`/api/events/${pendingEv.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Approved' });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.event.status).toBe('Approved');

    // Immediately fetch approved events -> it MUST be included
    const afterApprovalRes = await request(app).get('/api/events?limit=1000');
    expect(afterApprovalRes.status).toBe(200);
    const foundAfter = afterApprovalRes.body.events.find((e) => e.id === pendingEv.id);
    expect(foundAfter).toBeDefined();
    expect(foundAfter.title).toBe('Pending Workshop For Approval');
    expect(afterApprovalRes.body).toHaveProperty('pagination');
    expect(afterApprovalRes.body.pagination).toHaveProperty('totalPages');
  });
});
