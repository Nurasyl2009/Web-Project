const express = require('express');
const pool = require('../js/db');

const router = express.Router();

function toKey(cityName) {
  return encodeURIComponent(String(cityName || '').trim());
}

function defaultMapUrl(cityName) {
  const q = encodeURIComponent(String(cityName || '').trim());
  return q ? `https://maps.google.com/maps?q=${q}&output=embed` : '';
}

// GET /api/cities - list unique cities from tours
router.get('/', async (req, res) => {
  try {
    const rowsRes = await pool.query(`
      SELECT DISTINCT ON (city)
        city,
        image_url,
        map_url,
        route_text,
        created_at
      FROM tours
      WHERE city IS NOT NULL AND city <> ''
      ORDER BY city, created_at DESC
    `);

    const countsRes = await pool.query(`
      SELECT city, COUNT(*)::int AS tours_count
      FROM tours
      WHERE city IS NOT NULL AND city <> ''
      GROUP BY city
    `);

    const countMap = new Map(countsRes.rows.map((r) => [r.city, r.tours_count]));

    const cities = rowsRes.rows.map((r) => {
      const city = r.city;
      const toursCount = countMap.get(city) || 1;
      return {
        key: toKey(city),
        name: city,
        country: '—',
        icon: '📍',
        image: r.image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop',
        route: r.route_text || 'Google Maps маршрут',
        stops: `${toursCount} тур`,
        map_url: r.map_url || defaultMapUrl(city),
      };
    });

    res.json({ success: true, cities });
  } catch (err) {
    console.error('GET /api/cities қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

// GET /api/cities/:key - details by city name (encoded)
router.get('/:key', async (req, res) => {
  try {
    const cityName = decodeURIComponent(req.params.key || '').trim();
    if (!cityName) return res.status(400).json({ success: false, message: 'Қала атауы бос' });

    const rowRes = await pool.query(
      `
      SELECT *
      FROM tours
      WHERE city = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [cityName]
    );

    if (rowRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Қала табылмады' });
    }

    const tour = rowRes.rows[0];
    res.json({
      success: true,
      city: {
        key: toKey(cityName),
        name: cityName,
        image: tour.image_url || null,
        route_text: tour.route_text || '',
        map_url: tour.map_url || defaultMapUrl(cityName),
      },
    });
  } catch (err) {
    console.error('GET /api/cities/:key қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

module.exports = router;

