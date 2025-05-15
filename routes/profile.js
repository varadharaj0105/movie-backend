
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for handling file uploads
const upload = multer({
  dest: 'uploads/', // Folder where the uploaded files will be stored
  limits: { fileSize: 10 * 1024 * 1024 }, // File size limit: 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File must be an image'), false);
    }
    cb(null, true);
  }
});

const router = express.Router();

// GET profile - Fetch user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      favoriteGenre: user.favoriteGenre,
      location: user.location,
      birthdate: user.birthdate,
// In your backend response
profileImage: user.profileImage ? `http://localhost:5000/${user.profileImage.replace(/\\/g, '/')}` : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT profile - Update user profile (including image)
// PUT profile - Update user profile (including image)
router.put('/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { displayName, fullName, bio, favoriteGenre, location, birthdate } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update user's profile information
    user.username = displayName || user.username;
    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.favoriteGenre = favoriteGenre || user.favoriteGenre;
    user.location = location || user.location;

    // Ensure birthdate is valid
    if (birthdate && !isNaN(Date.parse(birthdate))) {
      user.birthdate = birthdate; // Only update if it's a valid date string
    } else {
      user.birthdate = null; // Set as null if invalid or empty
    }

    // Handle file upload if a new image is uploaded
    if (req.file) {
      const filePath = path.join('uploads', req.file.filename);
      user.profileImage = filePath; // Save the file path to the database
    }

    // Save the updated user profile
    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


module.exports = router;
