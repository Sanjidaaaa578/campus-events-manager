const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/**
 * Returns the database filepath based on NODE_ENV.
 * Uses :memory: for tests unless explicitly overridden.
 */
function getDatabasePath() {
  if (process.env.NODE_ENV === 'test') {
    return process.env.TEST_DB_PATH || ':memory:';
  }
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'campus_events.sqlite');
}

/**
 * Connects to the SQLite database.
 * @param {string} [customPath]
 * @returns {Promise<sqlite3.Database>}
 */
function connectDatabase(customPath) {
  const dbPath = customPath || getDatabasePath();
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        return reject(err);
      }
      // Enable foreign key constraints
      db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
        if (pragmaErr) return reject(pragmaErr);
        resolve(db);
      });
    });
  });
}

/**
 * Executes a SQL query with run (for INSERT, UPDATE, DELETE).
 */
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Executes a SQL query with get (single row).
 */
function getQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * Executes a SQL query with all (multiple rows).
 */
function allQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Initializes the database tables.
 * @param {sqlite3.Database} db
 * @returns {Promise<void>}
 */
async function initializeSchema(db) {
  // Users table
  await runQuery(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('Student', 'Organizer', 'Admin')) NOT NULL DEFAULT 'Student',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // Events table
  await runQuery(
    db,
    `CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organizer_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK(capacity > 0),
      category TEXT NOT NULL,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')) NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE
    );`
  );

  // Event Registrations table
  await runQuery(
    db,
    `CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('Registered', 'Cancelled', 'Waitlisted')) NOT NULL DEFAULT 'Registered',
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, student_id),
      FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
    );`
  );

  // Notifications table
  await runQuery(
    db,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );`
  );
}

module.exports = {
  getDatabasePath,
  connectDatabase,
  initializeSchema,
  runQuery,
  getQuery,
  allQuery
};
