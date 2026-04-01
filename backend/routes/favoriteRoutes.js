const express = require('express');
const pool = require('../js/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, f.id as favorite_id 
       FROM favorites f
       JOIN tours t ON f.tour_id = t.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, favorites: result.rows });
  } catch (err) {
    console.error('GET /favorites қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

router.post('/:tourId', authMiddleware, async (req, res) => {
  const tourId = req.params.tourId;
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, tour_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, tourId]
    );
    res.json({ success: true, message: 'Таңдаулыларға қосылды' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(404).json({ success: false, message: 'Тур табылмады' });
    }
    console.error('POST /favorites қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

router.delete('/:tourId', authMiddleware, async (req, res) => {
  const tourId = req.params.tourId;
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND tour_id = $2',
      [req.user.id, tourId]
    );
    res.json({ success: true, message: 'Таңдаулылардан өшірілді' });
  } catch (err) {
    console.error('DELETE /favorites қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

module.exports = router;
