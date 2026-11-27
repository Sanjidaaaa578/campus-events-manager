const request = require('supertest');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const EventModel = require('../../src/modules/events/event.model');
const {
  EventQueryContext,
  SortByDateStrategy,
  SortByTitleStrategy,
  SortByCapacityStrategy
} = require('../../src/patterns/event.strategy');

describe('Design Pattern: Strategy (Event Sorting Strategies)', () => {
  let db;
  let app;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
    app = createApp(db);

    const organizer = await UserModel.create(db, {
      name: 'Organizer Strats',
      email: 'strats@campus.edu',
      password: 'password123',
      role: 'Organizer'
    });

    // Create 3 Events with distinct dates, titles, and capacities
    const event1 = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Zeta Coding Fest',
      date: '2026-12-28',
      time: '10:00',
      venue: 'Lab 1',
      capacity: 30,
      category: 'Tech'
    });
    await EventModel.updateStatus(db, event1.id, 'Approved');

    const event2 = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Alpha Robotics Expo',
      date: '2026-12-10',
      time: '09:00',
      venue: 'Main Hall',
      capacity: 150,
      category: 'Tech'
    });
    await EventModel.updateStatus(db, event2.id, 'Approved');

    const event3 = await EventModel.create(db, {
      organizerId: organizer.id,
      title: 'Beta Career Fair',
      date: '2026-12-20',
      time: '11:00',
      venue: 'Auditorium',
      capacity: 80,
      category: 'Career'
    });
    await EventModel.updateStatus(db, event3.id, 'Approved');
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  test('SortByDateStrategy orders events chronologically', () => {
    const context = new EventQueryContext(new SortByDateStrategy());
    expect(context.getOrderByClause()).toBe('e.date ASC, e.time ASC');
  });

  test('SortByTitleStrategy orders events alphabetically', () => {
    const context = new EventQueryContext(new SortByTitleStrategy());
    expect(context.getOrderByClause()).toBe('e.title ASC');
  });

  test('SortByCapacityStrategy orders events by capacity descending', () => {
    const context = new EventQueryContext(new SortByCapacityStrategy());
    expect(context.getOrderByClause()).toBe('e.capacity DESC, e.date ASC');
  });

  test('GET /api/events?sortBy=title returns events sorted by title (Alpha, Beta, Zeta)', async () => {
    const res = await request(app).get('/api/events?sortBy=title');
    expect(res.status).toBe(200);
    expect(res.body.events.length).toBe(3);
    expect(res.body.events[0].title).toBe('Alpha Robotics Expo');
    expect(res.body.events[1].title).toBe('Beta Career Fair');
    expect(res.body.events[2].title).toBe('Zeta Coding Fest');
  });

  test('GET /api/events?sortBy=capacity returns events sorted by capacity descending (150, 80, 30)', async () => {
    const res = await request(app).get('/api/events?sortBy=capacity');
    expect(res.status).toBe(200);
    expect(res.body.events[0].capacity).toBe(150);
    expect(res.body.events[1].capacity).toBe(80);
    expect(res.body.events[2].capacity).toBe(30);
  });

  test('GET /api/events?sortBy=date returns events sorted by date ascending', async () => {
    const res = await request(app).get('/api/events?sortBy=date');
    expect(res.status).toBe(200);
    expect(res.body.events[0].date).toBe('2026-12-10');
    expect(res.body.events[1].date).toBe('2026-12-20');
    expect(res.body.events[2].date).toBe('2026-12-28');
  });
});
