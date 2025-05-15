// models/Watchlist.js
const { sequelize, DataTypes } = require('../config/db');

const Watchlist = sequelize.define('Watchlist', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  movieId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Watchlist;
