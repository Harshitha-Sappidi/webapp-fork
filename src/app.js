const express = require('express');
const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json()).use(express.text()).use(express.urlencoded({ extended: true }));

// Use routes
app.use('/', routes);

module.exports = app;
