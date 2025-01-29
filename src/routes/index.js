const express = require('express');
const healthzRoutes = require('./healthz');

const router = express.Router();

router.use(healthzRoutes);

module.exports = router;
