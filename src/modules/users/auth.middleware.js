const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campus-events-secret-key-12345';

/**
 * Generates a signed JWT token.
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Middleware: Verifies the JWT token from the Authorization header.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is missing or invalid'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Token has expired or is invalid'
      });
    }
    req.user = decoded;
    next();
  });
}

/**
 * Middleware: Authorizes specific user roles.
 * @param  {...string} allowedRoles
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  authorizeRoles
};
