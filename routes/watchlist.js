const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const Watchlist = require('../models/Watchlist');
const router = express.Router();

// Get all movies in the user's watchlist
router.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    const watchlist = await Watchlist.findAll({
      where: { userId: req.user.userId },
    });
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add movie to watchlist
router.post('/watchlist', authenticateToken, async (req, res) => {
  const { movieId } = req.body;
  try {
    const existingEntry = await Watchlist.findOne({
      where: { userId: req.user.userId, movieId },
    });
    if (existingEntry) {
      return res.status(400).json({ error: 'Movie already in watchlist' });
    }
    const watchlistItem = await Watchlist.create({
      userId: req.user.userId,
      movieId,
    });
    res.status(201).json({ message: 'Movie added to watchlist', watchlistItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movie to watchlist', detail: err.message });
  }
});

// Remove movie from watchlist
router.delete('/watchlist/:movieId', authenticateToken, async (req, res) => {
  const { movieId } = req.params;
  try {
    const watchlistItem = await Watchlist.findOne({
      where: { userId: req.user.userId, movieId },
    });
    if (!watchlistItem) return res.status(404).json({ error: 'Movie not in watchlist' });
    await watchlistItem.destroy();
    res.json({ message: 'Movie removed from watchlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove movie from watchlist' });
  }
});
// Check if a movie is in the user's watchlist
router.get('/watchlist/check', authenticateToken, async (req, res) => {
  const { movieId } = req.query;

  try {
    const watchlistItem = await Watchlist.findOne({
      where: {
        userId: req.user.userId,
        movieId
      }
    });

    if (watchlistItem) {
      res.json({ isInWatchlist: true });
    } else {
      res.json({ isInWatchlist: false });
    }
  } catch (err) {
    console.error('Error checking watchlist status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
