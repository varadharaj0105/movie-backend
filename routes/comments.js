const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const Comments = require('../models/Comments');
const Users = require('../models/User'); // Ensure this path is correct
const router = express.Router();

// Get all comments for a specific movie (public)
router.get('/comments/:movieId', async (req, res) => {
  const { movieId } = req.params;
  try {
    const comments = await Comments.findAll({
      where: { movieId },
      include: {
        model: Users,
        attributes: ['username'], // Adjust if using 'name' instead
      },
      order: [['createdAt', 'DESC']],
    });

    const formatted = comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      userId: comment.userId,
      username: comment.User.username, // or 'name' if your field is named that
      createdAt: comment.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment (requires authentication)
router.post('/comments', authenticateToken, async (req, res) => {
  const { movieId, text } = req.body;

  // Validation check
  if (!movieId || !text) {
    return res.status(400).json({ error: 'Movie ID and comment text are required' });
  }

  try {
    // Create a new comment
    const comment = await Comments.create({
      userId: req.user.userId,
      movieId,
      text,
    });

    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/comments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comments.findByPk(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the comment belongs to the authenticated user
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});
module.exports = router;
