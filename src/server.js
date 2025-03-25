const app = require('./app');
const logger = require('./services/logger');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 8080;

// Connecting to the database and starting the server
const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1); // Exit the process if the server fails to start
  }
};

startServer();
