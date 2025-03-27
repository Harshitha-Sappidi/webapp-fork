// statsdClient.js

const StatsD = require('node-statsd');

// Initialize the StatsD client 
const client = new StatsD({
  host: 'localhost', 
  port: 8125,
  prefix: 'webapp', 
});

module.exports = client;
