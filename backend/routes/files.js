const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { File, User } = require('../models');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Multer storage (memory)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST /upload - upload Excel file
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      // Validate file type (Excel)
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only Excel files are allowed' });
      }

      const fileKey = `uploads/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'private'
      };

      await s3.upload(params).promise();

      // Save file record
      const fileRecord = await File.create({
        userId: req.user.id,
        filename: req.file.originalname,
        s3Key: fileKey,
        s3Bucket: process.env.S3_BUCKET_NAME,
        size: req.file.size,
        mimeType: req.file.mimetype,
        status: 'uploaded'
      });

      // TODO: Trigger chunking and embedding Lambda (could be via SQS or direct invoke)
      // For now, just return success

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          size: fileRecord.size,
          uploadedAt: fileRecord.createdAt
        }
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

// GET /files - list user's files
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const files = await File.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['updatedAt'] }
      });
      res.json({ files });
    } catch (err) {
      console.error('Error fetching files:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

// GET /files/:id - get file details
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const file = await File.findOne({
        where: { id: req.params.id, userId: req.user.id },
        attributes: { exclude: ['updatedAt'] }
      });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json({ file });
    } catch (err) {
      console.error('Error fetching file:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

// DELETE /files/:id - delete file
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const file = await File.findOne({
        where: { id: req.params.id, userId: req.user.id }
      });
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      // Delete from S3
      const s3Params = {
        Bucket: file.s3Bucket,
        Key: file.s3Key
      };
      await s3.deleteObject(s3Params).promise();
      // Delete record
      await file.destroy();
      res.json({ message: 'File deleted successfully' });
    } catch (err) {
      console.error('Error deleting file:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

module.exports = router;