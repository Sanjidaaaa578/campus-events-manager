const bcrypt = require('bcryptjs');
const { runQuery, getQuery, allQuery } = require('../../config/database');
const { UserFactory } = require('../../patterns/user.factory');

class UserModel {
  /**
   * Creates a new user with hashed password.
   */
  static async create(db, { name, email, password, role = 'Student', department = null }) {
    if (!name || !email || !password) {
      const error = new Error('Name, email, and password are required');
      error.status = 400;
      throw error;
    }

    const validRoles = ['Student', 'Organizer', 'Admin'];
    if (!validRoles.includes(role)) {
      const error = new Error(`Role must be one of: ${validRoles.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const existingUser = await this.findByEmail(db, email);
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.status = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await runQuery(
      db,
      `INSERT INTO users (name, email, password, role, department)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), hashedPassword, role, department]
    );

    return this.findById(db, result.lastID);
  }

  /**
   * Finds a user by ID (excluding password) and instantiates with UserFactory.
   */
  static async findById(db, id) {
    const row = await getQuery(
      db,
      'SELECT id, name, email, role, department, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    if (!row) return null;
    return UserFactory.createUser(row);
  }

  /**
   * Finds a user by email (including password for authentication).
   */
  static async findByEmail(db, email) {
    const row = await getQuery(
      db,
      'SELECT id, name, email, password, role, department, created_at, updated_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return row || null;
  }

  /**
   * Verifies password against hashed password.
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Updates user profile (name, department, optional password).
   */
  static async updateProfile(db, id, { name, department, password }) {
    const user = await this.findById(db, id);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    let query = 'UPDATE users SET name = ?, department = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [name !== undefined ? name : user.name, department !== undefined ? department : user.department];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await runQuery(db, query, params);
    return this.findById(db, id);
  }
}

module.exports = UserModel;
