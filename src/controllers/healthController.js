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
  const startTime = Date.now();
  try {
    logger.info('Health check begin');
    // Ensuring no payload is in the request
    if ((Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) && !isFileUpload) {
      logger.warn('Health check request contains unexpected payload');
      logger.error('Health check request contains unexpected payload');
      
      // Track API usage and DB query time for this error
      trackApiUsage(req.route.path, req.method, Date.now() - startTime);
      trackDbQuery('health_check_failure', Date.now() - startTime); // Track DB query time on error
      
      return res.status(400).set(headers).send(); // Bad Request
    }

    // Perform the health check by creating a record (simulated DB query)
    await HealthCheck.create({});
    const duration = Date.now() - startTime;

    // Track API usage for successful health check request (this involves a DB query)
    trackApiUsage(req.route.path, req.method, duration);
    trackDbQuery('health_check_success', duration);

    logger.info('Health check passed successfully');
    return isFileUpload ? { statusCode: 200 } : res.status(200).set(headers).send(); // OK
  } catch (error) {
    const duration = Date.now() - startTime;

    // Track API usage for failed health check request
    trackApiUsage(req.route.path, req.method, duration);
    trackDbQuery('health_check_failure', duration);

    logger.warn('Health check failed');
    logger.error(`Health check failed: ${error.message}`);

    return isFileUpload ? { statusCode: 503 } : res.status(503).set(headers).send(); // Service Unavailable
  }
};

// Handle unsupported methods
exports.handleUnsupportedMethods = (req, res) => {
  trackApiUsage(req.route.path, req.method, 0); 
  
  logger.warn(`Unsupported method accessed: ${req.route.path}`);
  return res.status(405).set(headers).send(); // Method Not Allowed
};
