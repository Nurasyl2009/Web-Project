const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../js/db');
const { luhnCheck } = require('../middleware/luhn');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'travelway_secret_key_2026';
const MAX_SPOTS = 20;

// Auth middleware
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Токен жоқ' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Токен жарамсыз' });
  }
};

// GET /api/buy/availability - Күн бойынша бос орындарды тексеру
router.get('/availability', async (req, res) => {
  const { city, date } = req.query;
  if (!city || !date) {
    return res.json({ available: MAX_SPOTS });
  }

  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM payment WHERE city = $1 AND tour_date = $2',
      [city, date]
    );
    const booked = parseInt(result.rows[0].count, 10) || 0;
    const available = Math.max(0, MAX_SPOTS - booked);
    res.json({ available });
  } catch (err) {
    console.error('GET /buy/availability қатесі:', err.message);
    res.json({ available: MAX_SPOTS });
  }
});

// GET /api/buy/history — purchase history for logged-in user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rowCount === 0) {
      return res.json({ success: true, purchases: [] });
    }
    const userName = userResult.rows[0].name;
    const result = await pool.query(
      'SELECT name, city, tour_date, created_at FROM payment WHERE name = $1 ORDER BY created_at DESC',
      [userName]
    );
    res.json({ success: true, purchases: result.rows });
  } catch (err) {
    console.error('GET /buy/history қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

router.post('/', async (req, res) => {
  const { name, number, city, cvv, tourDate } = req.body;

  if (!name || !number || !city || !cvv || !tourDate) {
    return res.status(400).json({ success: false, message: 'Барлық өрістерді толтырыңыз (Күнді таңдау міндетті)' });
  }
  const digits = String(number).replace(/\D/g, '');
  if (digits.length !== 16) {
    return res.status(400).json({ success: false, message: 'Карта нөмірі 16 санды болуы керек' });
  }
  if (!luhnCheck(digits)) {
    return res.status(400).json({ success: false, message: 'Карта нөмірі жарамсыз' });
  }
  if (String(cvv).length !== 3 || isNaN(Number(cvv))) {
    return res.status(400).json({ success: false, message: 'CVV 3 санды болуы керек' });
  }

  try {
    // 1. Availability check before purchase
    const checkRes = await pool.query(
      'SELECT COUNT(*) FROM payment WHERE city = $1 AND tour_date = $2',
      [city, tourDate]
    );
    const booked = parseInt(checkRes.rows[0].count, 10) || 0;
    if (booked >= MAX_SPOTS) {
      return res.status(400).json({ success: false, message: 'Бұл күнге орын таусылған! Басқа күнді таңдаңыз.' });
    }

    // 2. Process purchase
    await pool.query(
      'INSERT INTO payment (name, number, city, cvv, tour_date) VALUES ($1, $2, $3, $4, $5)',
      [name, digits, city, cvv, tourDate]
    );

    res.json({ 
      success: true, 
      message: 'Тур сәтті брондалды!',
      amount: '450,000 ₸', // Simulated total amount
      bookedSpots: booked + 1
    });

  } catch (err) {
    console.error('POST /buy қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате. Кейінірек қайталаңыз.' });
  }
});

module.exports = router;
