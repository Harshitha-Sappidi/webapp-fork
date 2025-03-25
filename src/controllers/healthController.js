const HealthCheck = require('../models/healthCheck');
const logger = require('../services/logger');
const metrics = require('../services/metrics'); 

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

    logger.info(`Health check successful, Duration: ${duration}ms`);
    metrics.trackApiUsage('healthCheck', duration); // Track API usage in CloudWatch

    return isFileUPload ? { statusCode: 200 } : res.status(200).set(headers).send(); // OK
  } catch (error) {
    logger.warn('Health check failed');
    logger.error(`Health check failed: ${error.message}`, { stack: error.stack });
    metrics.trackApiError('healthCheck'); // Track error in CloudWatch
    
    return isFileUPload ? { statusCode: 503 } : res.status(503).set(headers).send(); // Service Unavailable
  }
};
// Handle unsupported methods
exports.handleUnsupportedMethods = (req, res) => {
  logger.warn('Unsupported method attempted');
  logger.error(`Unsupported method attempted: ${req.method} ${req.originalUrl}`);
  return res.status(405).set(headers).send(); // Method Not Allowed
};
