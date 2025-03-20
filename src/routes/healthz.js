const express = require('express');
const router = express.Router();
const healthCheckController = require('../controllers/healthController');

// Route for health check
router.head('/healthz', healthCheckController.handleUnsupportedMethods);
router.get('/healthz', (req, res) => healthCheckController.checkHealth(req, res, false));
router.all('/healthz', healthCheckController.handleUnsupportedMethods);

module.exports = router;
