const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { Session, User } = require('../models');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all sessions for current user (or admin could see all)
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const sessions = await Session.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['id', 'email', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(sessions);
  })
);

// GET session by ID
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await Session.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'email', 'name'] }],
    });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Ensure user owns session (or admin)
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(session);
  })
);

// CREATE session
router.post(
  '/',
  authenticateToken,
  [
    body('title').isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const session = await Session.create({
      userId: req.user.id,
      title,
      description: description || null,
    });

    const populated = await Session.findByPk(session.id, {
      include: [{ model: User, attributes: ['id', 'email', 'name'] }],
    });
    res.status(201).json(populated);
  })
);

// UPDATE session
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, description } = req.body;
    if (title !== undefined) session.title = title;
    if (description !== undefined) session.description = description;

    await session.save();

    const populated = await Session.findByPk(session.id, {
      include: [{ model: User, attributes: ['id', 'email', 'name'] }],
    });
    res.json(populated);
  })
);

// DELETE session
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await session.destroy();
    res.status(204).send();
  })
);

module.exports = router;