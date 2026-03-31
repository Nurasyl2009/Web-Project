const express = require('express');
const pool = require('../js/db');
const { adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('Admin users қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// Get all tours
router.get('/tours', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours ORDER BY id DESC');
    res.json({ success: true, tours: result.rows });
  } catch (err) {
    console.error('Admin tours қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// Add a new tour
router.post('/tours', adminMiddleware, async (req, res) => {
  const { title, description, price, city, image_url, map_url, route_text } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: 'Тақырыбы мен бағасы міндетті' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO tours (title, description, price, city, image_url, map_url, route_text) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, price, city, image_url, map_url || null, route_text || null]
    );
    res.status(201).json({ success: true, message: 'Тур қосылды', tour: result.rows[0] });
  } catch (err) {
    console.error('Add tour қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// Delete a tour
router.delete('/tours/:id', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tours WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Тур табылмады' });
    }
    res.json({ success: true, message: 'Тур өшірілді' });
  } catch (err) {
    console.error('Delete tour қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// Get all payments (orders)
router.get('/payments', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payment ORDER BY created_at DESC');
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    console.error('Admin payments қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// Update user role
router.put('/users/:id/role', adminMiddleware, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Қате рөл' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Пайдаланушы табылмады' });
    }
    res.json({ success: true, message: 'Рөл жаңартылды', user: result.rows[0] });
  } catch (err) {
    console.error('Update user role қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// Edit a tour
router.put('/tours/:id', adminMiddleware, async (req, res) => {
  const { title, description, price, city, image_url, map_url, route_text } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: 'Тақырыбы мен бағасы міндетті' });
  }
  try {
    const result = await pool.query(
      'UPDATE tours SET title = $1, description = $2, price = $3, city = $4, image_url = $5, map_url = $6, route_text = $7 WHERE id = $8 RETURNING *',
      [title, description, price, city, image_url, map_url || null, route_text || null, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Тур табылмады' });
    }
    res.json({ success: true, message: 'Тур жаңартылды', tour: result.rows[0] });
  } catch (err) {
    console.error('Update tour қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// Get statistics
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    // Top cities by bookings
    const citiesResult = await pool.query(
      'SELECT city, COUNT(*) as bookings FROM payment GROUP BY city ORDER BY bookings DESC LIMIT 5'
    );
    
    // Approximate revenue by city
    const revenueResult = await pool.query(`
      SELECT p.city, COUNT(p.id) * COALESCE(MAX(t.price), 0) as revenue
      FROM payment p
      LEFT JOIN tours t ON p.city = t.city
      GROUP BY p.city
      ORDER BY revenue DESC
    `);
    
    res.json({
      success: true,
      popularCities: citiesResult.rows.map(r => ({ city: r.city, bookings: parseInt(r.bookings, 10) })),
      revenueByCity: revenueResult.rows.map(r => ({ city: r.city, revenue: parseInt(r.revenue, 10) }))
    });
  } catch (err) {
    console.error('Admin stats қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

module.exports = router;
