const HealthCheck = require('../models/healthCheck');
const logger = require('../services/logger');
const { trackApiUsage, trackDbQuery } = require('../services/metrics'); 

const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

// Handling health check
exports.checkHealth = async (req, res, isFileUpload) => {
  try {
    logger.info('Health check begin');

    // Ensuring no payload is in the request
    if ((Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) && !isFileUpload) {
      logger.warn('Health check request contains unexpected payload');
      logger.error('Health check request contains unexpected payload');

      trackApiUsage(req.route.path, req.method);
      trackDbQuery('health_check');

      return res.status(400).set(headers).send(); // Bad Request
    }

    // Perform the health check by creating a record (simulated DB query)
    await HealthCheck.create({});
    
    trackApiUsage(req.route.path, req.method);
    trackDbQuery('health_check');

    logger.info('Health check passed successfully');
    return isFileUpload ? { statusCode: 200 } : res.status(200).set(headers).send(); // OK
  } catch (error) {
    trackApiUsage(req.route.path, req.method);
    trackDbQuery('health_check');

    logger.warn('Health check failed');
    logger.error(`Health check failed: ${error.message}`);

    return isFileUpload ? { statusCode: 503 } : res.status(503).set(headers).send(); // Service Unavailable
  }
};

// Handle unsupported methods
exports.handleUnsupportedMethods = (req, res) => {
  trackApiUsage(req.route.path, req.method);
  
  logger.warn(`Unsupported method accessed: ${req.route.path}`);
  return res.status(405).set(headers).send(); // Method Not Allowed
};
