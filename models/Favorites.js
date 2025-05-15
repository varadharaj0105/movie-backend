// models/Favorites.js
const { sequelize, DataTypes } = require('../config/db');

const Favorites = sequelize.define('Favorites', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  movieId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Favorites;
