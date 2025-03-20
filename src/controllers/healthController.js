const HealthCheck = require('../models/healthCheck');

const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

// Handling health check
exports.checkHealth = async (req, res, isFileUPload) => {
  try {

    // Ensuring no payload is in the request
    if ((Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) && !isFileUPload) {
      return res.status(400).set(headers).send(); // Bad Request
    }

    await HealthCheck.create({});
    return isFileUPload ? { statusCode: 200 } : res.status(200).set(headers).send(); // OK
  } catch (error) {
    console.error('Health check failed:', error);
    return isFileUPload ? { statusCode: 503 } : res.status(503).set(headers).send(); // Service Unavailable
  }
};
// Handle unsupported methods
exports.handleUnsupportedMethods = (req, res) => {
  return res.status(405).set(headers).send(); // Method Not Allowed
};
