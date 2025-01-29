const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the MySQL database successfully.');

    // To Bootstrap the database
    await sequelize.sync({ alter: true });
    console.log('Database schema bootstrapped successfully.');
  } catch (error) {
    console.error('Unable to connect or bootstrap the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
