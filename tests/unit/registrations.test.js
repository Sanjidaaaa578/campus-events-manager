const request = require('supertest');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const EventModel = require('../../src/modules/events/event.model');
const { generateToken } = require('../../src/modules/users/auth.middleware');

describe('Module 3: Event Registration Tests', () => {
  let db;
  let app;
  let organizerUser;
  let organizerToken;
  let otherOrganizerToken;
  let student1, student2, student3;
  let token1, token2, token3;
  let limitedEvent;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
    app = createApp(db);

    // Create Organizer
    organizerUser = await UserModel.create(db, {
      name: 'Organizer Sam',
      email: 'sam@campus.edu',
      password: 'password123',
      role: 'Organizer'
    });
    organizerToken = generateToken(organizerUser);

    const otherOrganizer = await UserModel.create(db, {
      name: 'Organizer Other',
      email: 'other_org@campus.edu',
      password: 'password123',
      role: 'Organizer'
    });
    otherOrganizerToken = generateToken(otherOrganizer);

    // Create 3 Students
    student1 = await UserModel.create(db, {
      name: 'Student One',
      email: 's1@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    token1 = generateToken(student1);

    student2 = await UserModel.create(db, {
      name: 'Student Two',
      email: 's2@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    token2 = generateToken(student2);

    student3 = await UserModel.create(db, {
      name: 'Student Three',
      email: 's3@campus.edu',
      password: 'password123',
      role: 'Student'
    });
    token3 = generateToken(student3);

    // Create an approved event with capacity = 2
    limitedEvent = await EventModel.create(db, {
      organizerId: organizerUser.id,
      title: 'Workshop with Limited Seats',
      description: 'Seats are strictly capped at 2',
      date: '2026-12-10',
      time: '14:00',
      venue: 'Lab 3',
      capacity: 2,
      category: 'Workshop'
    });

    await EventModel.updateStatus(db, limitedEvent.id, 'Approved');
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  describe('Registration and Capacity Management', () => {
    test('Student 1 successfully registers (1/2 seats filled)', async () => {
      const response = await request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(201);
      expect(response.body.registration.status).toBe('Registered');
      expect(response.body.message).toContain('confirmed');
    });

    test('Student 1 duplicate registration is rejected (409 Conflict)', async () => {
      const response = await request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already registered');
    });

    test('Student 2 successfully registers (2/2 seats filled - Event full)', async () => {
      const response = await request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${token2}`);

      expect(response.status).toBe(201);
      expect(response.body.registration.status).toBe('Registered');
    });

    test('Student 3 registers when full and is placed on Waiting List', async () => {
      const response = await request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${token3}`);

      expect(response.status).toBe(201);
      expect(response.body.registration.status).toBe('Waitlisted');
      expect(response.body.message).toContain('waiting list');
    });
  });

  describe('Student Registered Events (GET /api/registrations/my-events)', () => {
    test('Student 1 views their registered events', async () => {
      const response = await request(app)
        .get('/api/registrations/my-events')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.events.length).toBe(1);
      expect(response.body.events[0].title).toBe('Workshop with Limited Seats');
      expect(response.body.events[0].registration_status).toBe('Registered');
    });

    test('Student 3 views their waitlisted event', async () => {
      const response = await request(app)
        .get('/api/registrations/my-events')
        .set('Authorization', `Bearer ${token3}`);

      expect(response.status).toBe(200);
      expect(response.body.events.length).toBe(1);
      expect(response.body.events[0].registration_status).toBe('Waitlisted');
    });
  });

  describe('Cancellation and Automatic Waitlist Promotion', () => {
    test('Student 1 cancels registration -> Student 3 is automatically promoted from waitlist', async () => {
      const response = await request(app)
        .delete(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.promotedStudent).toBeDefined();
      expect(response.body.promotedStudent.student_id).toBe(student3.id);
      expect(response.body.promotedStudent.status).toBe('Registered');
    });

    test('Student 3 status is now Registered in My Events', async () => {
      const response = await request(app)
        .get('/api/registrations/my-events')
        .set('Authorization', `Bearer ${token3}`);

      expect(response.status).toBe(200);
      expect(response.body.events[0].registration_status).toBe('Registered');
    });
  });

  describe('Organizer Attendee List (GET /api/events/:id/attendees)', () => {
    test('Organizer can view attendee list and counts', async () => {
      const response = await request(app)
        .get(`/api/events/${limitedEvent.id}/attendees`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.eventTitle).toBe('Workshop with Limited Seats');
      expect(response.body.totalRegistered).toBe(2); // student2 and student3
      expect(response.body.attendees.length).toBe(2);
    });

    test('Other organizer cannot view attendee list for another organizer event', async () => {
      const response = await request(app)
        .get(`/api/events/${limitedEvent.id}/attendees`)
        .set('Authorization', `Bearer ${otherOrganizerToken}`);

      expect(response.status).toBe(403);
    });
  });
});
