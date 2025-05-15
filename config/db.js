// config/db.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const initDB = async () => {
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
  await sequelize.sync();
};

module.exports = { sequelize, DataTypes, initDB };
