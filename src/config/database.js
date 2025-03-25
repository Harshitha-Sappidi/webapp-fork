const { Sequelize } = require('sequelize');
require('dotenv').config();
const { trackDbQuery } = require('../services/metrics');
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
    const duration = Date.now() - startTime;
    trackDbQuery('connect', duration);
    logger.info('Connected to the MySQL database successfully.');

    // To Bootstrap the database
    const syncStartTime = Date.now(); // Start time for schema sync
    await sequelize.sync({ alter: true });
    const syncDuration = Date.now() - syncStartTime;
    trackDbQuery('sync', syncDuration); // Track database schema sync performance
    logger.info(`Database schema bootstrapped successfully.`);
    logger.info(`Schema sync took ${syncDuration}ms`);
  } catch (error) {
    logger.error(`Unable to connect or bootstrap the database: ${error.message}`);
    process.exit(1); // Exit the process if connection fails
  }
};

module.exports = { sequelize, connectDB };
