const express = require('express');
const healthzRoutes = require('./healthz');
const fileRoutes = require('./routes/fileRoutes');

const router = express.Router();

router.use(healthzRoutes, fileRoutes);

module.exports = router;
