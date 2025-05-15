
const { sequelize, DataTypes } = require('../config/db');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },

  // New field to store the path of the profile image
  profileImage: { type: DataTypes.STRING, allowNull: true },

  // Other fields you may have
  fullName: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  favoriteGenre: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  birthdate: { type: DataTypes.DATE, allowNull: true }
});

// Optionally, you can add a method to get the full URL if needed
User.prototype.getProfileImageUrl = function() {
  return this.profileImage ? `http://localhost:5000/${this.profileImage}` : null;
};

module.exports = User;
