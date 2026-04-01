const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Hashes a plain text password using bcrypt.
 * @param {string} plainPassword - The plain text password to hash.
 * @returns {Promise<string>} A promise that resolves to the hashed password.
 */
async function hashPassword(plainPassword) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compares a plain text password with a hashed password.
 * @param {string} plainPassword - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} A promise that resolves to true if passwords match, false otherwise.
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generates a JWT token containing the payload.
 * @param {Object} payload - The data to encode in the token (e.g., { userId, email }).
 * @returns {string} The signed JWT token.
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param {string} token - The JWT token to verify.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If the token is invalid or expired.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};