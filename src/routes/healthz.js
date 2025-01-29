const express = require('express');
const router = express.Router();
const healthCheckController = require('../controllers/healthController');

// Route for health check
router.head('/healthz', healthCheckController.handleUnsupportedMethods);
router.get('/healthz', healthCheckController.checkHealth);
router.all('/healthz', healthCheckController.handleUnsupportedMethods);

module.exports = router;
