const jwt = require('jsonwebtoken');
const { verifyToken } = require('../services/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

/**
 * Middleware to authenticate JWT tokens.
 * Expects Authorization header in the format: Bearer <token>
 * Attaches decoded user info to req.user on success.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    // Attach user info to request for downstream handlers
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = {
  authenticateJWT,
};