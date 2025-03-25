// statsdClient.js

const StatsD = require('node-statsd');
const client = new StatsD({
  host: 'localhost', // Change this to your StatsD server address
  port: 8125,        // Change this if your StatsD server runs on a different port
});

module.exports = client;