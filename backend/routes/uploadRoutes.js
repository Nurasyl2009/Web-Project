const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../js/db');
const jwt = require('jsonwebtoken');

// Жүктелетін суреттерді сақтайтын папка (uploads/)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // avatar_userId_timestamp.jpg (мысалы)
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Тек суреттер жүктеуге болады!'));
    }
  }
});

// Middleware for token (Auth)
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Расталмады' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'travelway_secret_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Жарамсыз токен' });
  }
};

// POST /api/upload/avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Сурет жүктелмеді' });
    }

    const userId = req.user.id;
    // URL жолын құру: мысалы /uploads/avatar_1234.jpg
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Дерекқордағы пайдаланушыны жаңарту
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);

    res.json({ success: true, avatar_url: avatarUrl, message: 'Сурет сәтті сақталды!' });
  } catch (err) {
    console.error('Avatar upload қатесі:', err);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

module.exports = router;
