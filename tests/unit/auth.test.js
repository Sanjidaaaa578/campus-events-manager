const request = require('supertest');
const { createApp } = require('../../src/app');
const { connectDatabase, initializeSchema } = require('../../src/config/database');
const UserModel = require('../../src/modules/users/user.model');
const { authorizeRoles, generateToken } = require('../../src/modules/users/auth.middleware');

describe('Module 1: Users & Authentication Tests', () => {
  let db;
  let app;

  beforeAll(async () => {
    db = await connectDatabase(':memory:');
    await initializeSchema(db);
    app = createApp(db);
  });

  afterAll((done) => {
    if (db) {
      db.close(done);
    } else {
      done();
    }
  });

  describe('User Registration (POST /api/auth/register)', () => {
    test('should successfully register a student user with hashed password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Student',
          email: 'john@campus.edu',
          password: 'securePassword123',
          role: 'Student',
          department: 'Computer Science'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('john@campus.edu');
      expect(response.body.user.role).toBe('Student');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should reject registration if email is already taken', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Duplicate',
          email: 'john@campus.edu',
          password: 'anotherPassword',
          role: 'Student'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already registered');
    });

    test('should reject registration with invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Role User',
          email: 'invalid@campus.edu',
          password: 'password',
          role: 'SuperUser'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Role must be one of');
    });
  });

  describe('User Login (POST /api/auth/login)', () => {
    test('should successfully log in with correct credentials and return JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@campus.edu',
          password: 'securePassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('john@campus.edu');
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@campus.edu',
          password: 'wrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@campus.edu',
          password: 'password'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('User Profile (GET & PUT /api/users/profile)', () => {
    let studentToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@campus.edu',
          password: 'securePassword123'
        });
      studentToken = loginRes.body.token;
    });

    test('should fetch own profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('john@campus.edu');
      expect(response.body.user.department).toBe('Computer Science');
    });

    test('should reject profile access without auth token', async () => {
      const response = await request(app).get('/api/users/profile');
      expect(response.status).toBe(401);
    });

    test('should update own profile details', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'John Updated',
          department: 'Software Engineering'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe('John Updated');
      expect(response.body.user.department).toBe('Software Engineering');
    });
  });

  describe('Role-based Access Authorization Middleware', () => {
    test('should deny access if user role is not authorized', () => {
      const req = { user: { role: 'Student' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const middleware = authorizeRoles('Admin', 'Organizer');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should grant access if user role is authorized', () => {
      const req = { user: { role: 'Admin' } };
      const res = {};
      const next = jest.fn();

      const middleware = authorizeRoles('Admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
