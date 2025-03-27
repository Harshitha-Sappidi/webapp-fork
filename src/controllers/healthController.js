const HealthCheck = require('../models/healthCheck');
const { trackApiUsage, trackDbQuery } = require('../services/metrics'); // Import the tracking functions
const logger = require('../services/logger'); // Assuming the logger you provided earlier

const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

// Handling health check
exports.checkHealth = async (req, res, isFileUpload) => {
  return await trackApiUsage('checkHealth', async () => {
    try {
      // Ensuring no payload is in the request
      if ((Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) && !isFileUpload) {
        logger.warn('Health check received with unexpected payload', { query: req.query, body: req.body });
        return res.status(400).set(headers).send(); // Bad Request
      }

      // Track the database query for HealthCheck creation
      await trackDbQuery('healthCheckCreate', async () => {
        try {
          await HealthCheck.create({});
          logger.info('HealthCheck record created successfully');
        } catch (dbError) {
          logger.error('Error creating HealthCheck record', { error: dbError });
          throw dbError;
        }
      });

      logger.info('Health check passed');
      return isFileUpload ? { statusCode: 200 } : res.status(200).set(headers).send(); // OK
    } catch (error) {
      logger.error('Health check failed', { error: error.stack });
      return isFileUpload ? { statusCode: 503 } : res.status(503).set(headers).send(); // Service Unavailable
    }
  });
};

// Handle unsupported methods
exports.handleUnsupportedMethods = (req, res) => {
  logger.warn('Unsupported method received', { method: req.method, path: req.originalUrl });
  return res.status(405).set(headers).send(); // Method Not Allowed
};
