
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const tmdbRoutes = require('./routes/tmdb');
const watchlistRoutes = require('./routes/watchlist');
const favoritesRoutes = require('./routes/favorites');

const commentsRoutes = require('./routes/comments');
const ratingsRoutes = require('./routes/ratings');
const path = require('path');

const app = express();
app.use(cors({ origin: 'https://cinemindss.netlify.app' }));
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://cinemindss.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', tmdbRoutes);
app.use('/', watchlistRoutes);
app.use('/', favoritesRoutes);

app.use('/api', commentsRoutes);
app.use('/api', ratingsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
initDB().catch(err => console.error('❌ DB Init Error:', err));
app.js
