const { Sequelize } = require('sequelize');
require('dotenv').config();
const metrics = require('../services/metrics');
const logger = require('../services/logger');

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
  const start = Date.now();
  try {
    logger.info('Attempting to connect to MySQL database...');
    await sequelize.authenticate();
    logger.info('Connected to the MySQL database successfully.');

    // To Bootstrap the database
    await sequelize.sync({ alter: true });
    logger.info('Database schema bootstrapped successfully.');
  } catch (error) {
    logger.error(`Database connection/bootstrap failed: ${error.message}`);
    process.exit(1);
  } finally {
    const duration = Date.now() - start;
    metrics.recordExecutionTime('database.query', duration);
    logger.info(`Database query execution time recorded: ${duration}ms`);
  }
};

module.exports = { sequelize, connectDB };
