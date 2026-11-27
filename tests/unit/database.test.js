const {
  connectDatabase,
  initializeSchema,
  runQuery,
  getQuery,
  allQuery
} = require('../../src/config/database');

describe('Database Configuration & Schema Initialization', () => {
  let db;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  test('should create all required tables', async () => {
    const tables = await allQuery(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('users');
    expect(tableNames).toContain('events');
    expect(tableNames).toContain('registrations');
    expect(tableNames).toContain('notifications');
  });

  test('should insert and fetch a user with role constraint validation', async () => {
    const result = await runQuery(
      db,
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Alice Student', 'alice@campus.edu', 'hashedpassword', 'Student']
    );

    expect(result.lastID).toBeDefined();

    const user = await getQuery(db, 'SELECT * FROM users WHERE email = ?', ['alice@campus.edu']);
    expect(user).toBeDefined();
    expect(user.role).toBe('Student');
    expect(user.name).toBe('Alice Student');

    // Invalid role constraint check
    await expect(
      runQuery(
        db,
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Bob Invalid', 'bob@campus.edu', 'password', 'SuperAdmin']
      )
    ).rejects.toThrow();
  });

  test('should enforce foreign keys on event creation', async () => {
    // Non-existent organizer_id should throw FOREIGN KEY constraint failed
    await expect(
      runQuery(
        db,
        `INSERT INTO events (organizer_id, title, description, date, time, venue, capacity, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [9999, 'Tech Talk', 'Talk on AI', '2026-12-01', '10:00', 'Hall A', 50, 'Academic']
      )
    ).rejects.toThrow(/FOREIGN KEY/);
  });
});
