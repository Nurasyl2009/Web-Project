
const express = require('express');
const pool = require('../js/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, price, city, image_url, map_url, route_text FROM tours ORDER BY id ASC'
    );
    const tours = result.rows.map((t) => ({
      ...t,
      price: `${Number(t.price).toLocaleString('kk-KZ')} ₸`,
      badge: t.city,
      image: t.image_url,
    }));
    res.json(tours);
  } catch (err) {
    console.error('GET /tours қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID дұрыс емес' });

  try {
    const result = await pool.query('SELECT * FROM tours WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Тур табылмады' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /tours/:id қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, price, city, image_url, map_url, route_text } = req.body;

  if (!title || !price || !city) {
    return res.status(400).json({ success: false, message: 'Атауы, бағасы және қаласы міндетті' });
  }
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ success: false, message: 'Баға дұрыс емес' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tours (title, description, price, city, image_url, map_url, route_text) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description || '', price, city, image_url || '', map_url || null, route_text || null]
    );
    res.status(201).json({ success: true, message: 'Тур қосылды', tour: result.rows[0] });
  } catch (err) {
    console.error('POST /tours қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID дұрыс емес' });

  const { title, description, price, city, image_url, map_url, route_text } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM tours WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Тур табылмады' });
    }

    const result = await pool.query(
      `UPDATE tours
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           city = COALESCE($4, city),
           image_url = COALESCE($5, image_url),
           map_url = COALESCE($6, map_url),
           route_text = COALESCE($7, route_text)
       WHERE id = $8
       RETURNING *`,
      [title, description, price, city, image_url, map_url, route_text, id]
    );
    res.json({ success: true, message: 'Тур жаңартылды', tour: result.rows[0] });
  } catch (err) {
    console.error('PUT /tours/:id қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID дұрыс емес' });

  try {
    const result = await pool.query('DELETE FROM tours WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Тур табылмады' });
    }
    res.json({ success: true, message: 'Тур жойылды' });
  } catch (err) {
    console.error('DELETE /tours/:id қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

module.exports = router;
