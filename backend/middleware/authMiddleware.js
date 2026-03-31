const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'travelway_secret_key_2026';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Токен жоқ' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Токен жарамсыз' });
  }
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Құпия рұқсат! Сіз админ емессіз.' });
    }
  });
};

module.exports = { authMiddleware, adminMiddleware };
