
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const tourRoutes = require('./routes/tourRoutes');
const purchaseRoute = require('./routes/purchaseRoute');
const contactRoute = require('./routes/contactRoute');
const adminRoutes = require('./routes/adminRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cityRoutes = require('./routes/cityRoutes');

const app = express();

app.use(cors({
  origin: '*', // Уақытша бәріне рұқсат беру
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/buy', purchaseRoute);
app.use('/api/contact', contactRoute);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cities', cityRoutes);

// Суреттер орналасқан (uploads) папкасын статикалық түрде көруге ашу
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const clientBuild = path.join(__dirname, '../frontend', 'dist');
app.use(express.static(clientBuild));

app.get('*', (req, res) => {
  const indexFile = path.join(clientBuild, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(404).send('Бет табылмады (404)');
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Сервер қатесі:', err.stack);
  res.status(500).json({ success: false, message: 'Серверлік қате. Кейінірек қайталаңыз.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Сервер іске қосылды: http://localhost:${PORT}`);
});