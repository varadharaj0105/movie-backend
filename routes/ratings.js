const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const Ratings = require('../models/Ratings');
const router = express.Router();

// Get a user's rating for a specific movie
// Fetch ratings from the database for a specific movie
const { sequelize } = require('../config/db'); // Make sure sequelize is imported


// Get total rating score and count for a movie from DB
router.get('/ratings/:movieId', async (req, res) => {
  const { movieId } = req.params;
  try {
    const result = await Ratings.findAll({
      where: { movieId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('score')), 'totalScore'],
        [sequelize.fn('COUNT', sequelize.col('score')), 'count']
      ],
      raw: true
    });

    const { totalScore, count } = result[0];
    res.json({
      totalScore: parseFloat(totalScore) || 0,
      count: parseInt(count) || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rating stats' });
  }
});


// Add or update a rating
// Add or update a rating
router.post('/ratings', authenticateToken, async (req, res) => {
  const { movieId, score } = req.body;

  try {
    // Upsert the rating (insert or update)
    const [rating, created] = await Ratings.upsert({
      userId: req.user.userId,
      movieId,
      score,
    }, { returning: true });

    // After posting/updating the rating, fetch the updated count of ratings
    const ratingsCount = await Ratings.count({
      where: { movieId },
    });

    res.status(201).json({
      message: created ? 'Rating added' : 'Rating updated',
      rating,
      ratingsCount,  // Return the updated count
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

module.exports = router;
