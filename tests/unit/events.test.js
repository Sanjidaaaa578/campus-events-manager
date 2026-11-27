const request = require('supertest');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const { generateToken } = require('../../src/modules/users/auth.middleware');

describe('Module 2: Event Management Tests', () => {
  let db;
  let app;
  let organizerUser;
  let organizerToken;
  let otherOrganizerToken;
  let studentToken;
  let adminToken;
  let testEventId;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
    app = createApp(db);

    // Setup Organizer
    organizerUser = await UserModel.create(db, {
      name: 'Organizer Bob',
      email: 'bob@campus.edu',
      password: 'password123',
      role: 'Organizer',
      department: 'Student Affairs'
    });
    organizerToken = generateToken(organizerUser);

    // Setup Other Organizer
    const otherOrganizer = await UserModel.create(db, {
      name: 'Organizer Charlie',
      email: 'charlie@campus.edu',
      password: 'password123',
      role: 'Organizer',
      department: 'Robotics Club'
    });
    otherOrganizerToken = generateToken(otherOrganizer);

    // Setup Student
    const studentUser = await UserModel.create(db, {
      name: 'Student Alice',
      email: 'alice@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    studentToken = generateToken(studentUser);

    // Setup Admin
    const adminUser = await UserModel.create(db, {
      name: 'Admin Dave',
      email: 'dave@campus.edu',
      password: 'password123',
      role: 'Admin'
    });
    adminToken = generateToken(adminUser);
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  describe('Event Creation (POST /api/events)', () => {
    test('Organizer can create an event (defaults status to Pending)', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Campus Hackathon 2026',
          description: '48 hour annual software hackathon',
          date: '2026-12-15',
          time: '09:00',
          venue: 'Engineering Auditorium',
          capacity: 100,
          category: 'Technology'
        });

      expect(response.status).toBe(201);
      expect(response.body.event).toHaveProperty('id');
      expect(response.body.event.title).toBe('Campus Hackathon 2026');
      expect(response.body.event.status).toBe('Pending');
      expect(response.body.event.capacity).toBe(100);
      testEventId = response.body.event.id;
    });

    test('Student cannot create an event (403 Forbidden)', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Party',
          date: '2026-12-16',
          time: '18:00',
          venue: 'Cafeteria',
          capacity: 50,
          category: 'Social'
        });

      expect(response.status).toBe(403);
    });

    test('Rejects event creation with missing fields or invalid capacity', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Incomplete Event'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Admin Approval/Rejection (PATCH /api/events/:id/status)', () => {
    test('Non-admin cannot approve or reject event', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEventId}/status`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ status: 'Approved' });

      expect(response.status).toBe(403);
    });

    test('Admin approves the submitted event', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Approved' });

      expect(response.status).toBe(200);
      expect(response.body.event.status).toBe('Approved');
    });
  });

  describe('Search & Filter Events (GET /api/events)', () => {
    beforeAll(async () => {
      // Create additional approved events for search/filtering
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Career Fair & Networking',
          description: 'Meet top employers and alumni',
          date: '2026-12-20',
          time: '11:00',
          venue: 'Main Gymnasium',
          capacity: 300,
          category: 'Career'
        });

      await request(app)
        .patch(`/api/events/${res.body.event.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Approved' });
    });

    test('should search events by keyword', async () => {
      const response = await request(app).get('/api/events?keyword=Hackathon');
      expect(response.status).toBe(200);
      expect(response.body.events.length).toBeGreaterThanOrEqual(1);
      expect(response.body.events[0].title).toContain('Hackathon');
    });

    test('should filter events by category', async () => {
      const response = await request(app).get('/api/events?category=Career');
      expect(response.status).toBe(200);
      expect(response.body.events.length).toBe(1);
      expect(response.body.events[0].category).toBe('Career');
    });

    test('should filter events by date', async () => {
      const response = await request(app).get('/api/events?date=2026-12-15');
      expect(response.status).toBe(200);
      expect(response.body.events.length).toBe(1);
      expect(response.body.events[0].date).toBe('2026-12-15');
    });
  });

  describe('Edit & Delete Events (PUT & DELETE /api/events/:id)', () => {
    test('Other organizer cannot edit someone else event', async () => {
      const response = await request(app)
        .put(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${otherOrganizerToken}`)
        .send({ title: 'Hijacked Event' });

      expect(response.status).toBe(403);
    });

    test('Original organizer can edit event details', async () => {
      const response = await request(app)
        .put(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ venue: 'Innovation Lab Room 101', capacity: 120 });

      expect(response.status).toBe(200);
      expect(response.body.event.venue).toBe('Innovation Lab Room 101');
      expect(response.body.event.capacity).toBe(120);
    });

    test('Original organizer can delete event', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const checkRes = await request(app).get(`/api/events/${testEventId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
