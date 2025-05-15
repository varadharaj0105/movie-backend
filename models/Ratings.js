const { sequelize, DataTypes } = require('../config/db');

const Ratings = sequelize.define('Ratings', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false, // Rating should be a number (0-10 or whatever range you want)
  },
}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  indexes: [
    {
      unique: true, // Ensure that each user can only rate a movie once
      fields: ['userId', 'movieId'], // Add unique constraint on the combination of `userId` and `movieId`
    },
  ],
});

module.exports = Ratings;
