
const express = require('express');
const pool = require('../js/db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Барлық өрістерді толтырыңыз' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Email форматы дұрыс емес' });
  }
  if (message.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Хабарлама тым қысқа' });
  }

  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
      [name.trim(), email.trim(), message.trim()]
    );
    res.json({ success: true, message: 'Хабарламаңыз қабылданды!' });
  } catch (err) {
    console.error('POST /contact қатесі:', err.message);
    res.status(500).json({ success: false, message: 'Серверлік қате' });
  }
});

module.exports = router;
