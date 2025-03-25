const HealthCheck = require('../models/healthCheck');
const logger = require('../services/logger');
const { trackApiUsage, trackApiError } = require('../services/metrics'); 

const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

// Handling health check
exports.checkHealth = async (req, res, isFileUPload) => {
  const startTime = Date.now();
  try {
    logger.info('Health check begin');
    // Ensuring no payload is in the request
    if ((Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) && !isFileUPload) {
      logger.warn('Health check request contains unexpected payload');
      logger.error('Health check request contains unexpected payload');
      return res.status(400).set(headers).send(); // Bad Request
    }

    await HealthCheck.create({});
    const duration = Date.now() - startTime;
    trackApiUsage(req.route.path, req.method, duration); // Track successful health check

    logger.info('Health check passed successfully');
    return isFileUPload ? { statusCode: 200 } : res.status(200).set(headers).send(); // OK
  } catch (error) {
    const duration = Date.now() - startTime;
    trackApiError(req.route.path, duration); // Track error for failed health check
    logger.warn('Health check failed');
    logger.error(`Health check failed: ${error.message}`);
   return isFileUPload ? { statusCode: 503 } : res.status(503).set(headers).send(); // Service Unavailable
  }
};
// Handle unsupported methods
exports.handleUnsupportedMethods = (req, res) => {
  trackApiError(req.route.path, 0);
  logger.warn(`Unsupported method accessed: ${req.route.path}`);
  return res.status(405).set(headers).send(); // Method Not Allowed
};
