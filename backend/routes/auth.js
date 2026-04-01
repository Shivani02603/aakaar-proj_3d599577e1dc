const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      });

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });

      res.json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get current user (protected)
router.get(
  '/me',
  require('../middleware/auth').authenticateToken,
  async (req, res) => {
    try {
      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          createdAt: req.user.createdAt,
        },
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;