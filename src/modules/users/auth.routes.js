const express = require('express');
const UserModel = require('./user.model');
const { generateToken, authenticateToken } = require('./auth.middleware');

function createAuthRoutes(getDb) {
  const router = express.Router();

  // POST /api/auth/register
  router.post('/register', async (req, res, next) => {
    try {
      const { name, email, password, role, department } = req.body;
      const db = typeof getDb === 'function' ? await getDb() : getDb;

      const newUser = await UserModel.create(db, { name, email, password, role, department });
      const token = generateToken(newUser);

      res.status(201).json({
        message: 'User registered successfully',
        user: newUser,
        token
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Email and password are required'
        });
      }

      const db = typeof getDb === 'function' ? await getDb() : getDb;
      const user = await UserModel.findByEmail(db, email);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      const isValidPassword = await UserModel.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user);
      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      };

      res.status(200).json({
        message: 'Login successful',
        user: userProfile,
        token
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/users/profile (View own profile)
  router.get('/profile', authenticateToken, async (req, res, next) => {
    try {
      const db = typeof getDb === 'function' ? await getDb() : getDb;
      const user = await UserModel.findById(db, req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'NotFound', message: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/users/profile (Edit own profile)
  router.put('/profile', authenticateToken, async (req, res, next) => {
    try {
      const { name, department, password } = req.body;
      const db = typeof getDb === 'function' ? await getDb() : getDb;

      const updatedUser = await UserModel.updateProfile(db, req.user.id, {
        name,
        department,
        password
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createAuthRoutes;
