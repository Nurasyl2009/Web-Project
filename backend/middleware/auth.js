
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'travelway_secret_key_2026';

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Авторизация қажет' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Сессия мерзімі аяқталды, қайта кіріңіз' });
    }
    return res.status(403).json({ success: false, message: 'Жарамсыз токен' });
  }
}

module.exports = auth;
