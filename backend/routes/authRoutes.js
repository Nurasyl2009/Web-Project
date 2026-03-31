const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../js/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'travelway_secret_key_2026';

const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Барлық өрістерді толтырыңыз' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ success: false, message: 'Бұл email тіркелген' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, avatar_url',
      [name, email, hashed]
    );
    res.status(201).json({ success: true, message: 'Тіркелу сәтті!', user: result.rows[0] });
  } catch (err) {
    console.error('Register қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email мен құпия сөзді енгізіңіз' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Мұндай пайдаланушы табылмады' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Құпия сөз дұрыс емес' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Login қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате: ' + err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Пайдаланушы табылмады' });
    }
    const userName = userResult.rows[0].name;
    const statsResult = await pool.query(
      'SELECT COUNT(*) as total, COUNT(DISTINCT city) as cities FROM payment WHERE name = $1',
      [userName]
    );
    res.json({
      success: true,
      user: userResult.rows[0],
      stats: {
        bookedTours: parseInt(statsResult.rows[0].total) || 0,
        visitedCities: parseInt(statsResult.rows[0].cities) || 0,
      }
    });
  } catch (err) {
    console.error('Me қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате: ' + err.message });
  }
});

router.put('/update', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Аты-жөні бос болмасын' });
  }
  try {
    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name.trim(), req.user.id]);
    res.json({ success: true, message: 'Деректер жаңартылды' });
  } catch (err) {
    console.error('Update қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

module.exports = router;