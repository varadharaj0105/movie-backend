//routes/favorites

const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const Favorites = require('../models/Favorites');
const router = express.Router();

// Get all favorite movies of the user
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorites.findAll({
      where: { userId: req.user.userId },
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add movie to favorites
router.post('/favorites', authenticateToken, async (req, res) => {
  const { movieId } = req.body;
  try {
    const existingEntry = await Favorites.findOne({
      where: { userId: req.user.userId, movieId },
    });
    if (existingEntry) {
      return res.status(400).json({ error: 'Movie already in favorites' });
    }
    const favoriteItem = await Favorites.create({
      userId: req.user.userId,
      movieId,
    });
    res.status(201).json({ message: 'Movie added to favorites', favoriteItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movie to favorites', detail: err.message });
  }
});

// Remove movie from favorites
router.delete('/favorites/:movieId', authenticateToken, async (req, res) => {
  const { movieId } = req.params;
  try {
    const favoriteItem = await Favorites.findOne({
      where: { userId: req.user.userId, movieId },
    });
    if (!favoriteItem) return res.status(404).json({ error: 'Movie not in favorites' });
    await favoriteItem.destroy();
    res.json({ message: 'Movie removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove movie from favorites' });
  }
});
// Check if a movie is in user's favorites
router.get('/favorites/check', authenticateToken, async (req, res) => {
  const { movieId } = req.query;

  try {
    const favorite = await Favorites.findOne({
      where: {
        userId: req.user.userId,
        movieId
      }
    });

    if (favorite) {
      res.json({ isFavorite: true });
    } else {
      res.json({ isFavorite: false });
    }
  } catch (err) {
    console.error('Error checking favorite status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
