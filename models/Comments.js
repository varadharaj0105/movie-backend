const { sequelize, DataTypes } = require('../config/db');
const Users = require('./User'); // Ensure this path is correct

const Comments = sequelize.define('Comments', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  indexes: [
    // Removed the unique constraint to allow multiple comments from the same user on the same movie
    {
      fields: ['userId'], // You can still keep the index for performance if necessary
    },
  ],
});

// Association: One user can have many comments
Comments.belongsTo(Users, { foreignKey: 'userId' });

module.exports = Comments;
