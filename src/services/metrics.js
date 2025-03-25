// const StatsD = require("node-statsd");
// const client = new StatsD({ host: "127.0.0.1", port: 8125 });

// // Track API Calls
// function trackApiUsage(apiName, durationMs) {
//   client.increment(`webapp.api.${apiName}.count`); // Count API calls
//   client.timing(`webapp.api.${apiName}.response_time`, durationMs); // API response time
// }

// // Track Database Query Performance
// function trackDatabaseQuery(queryName, durationMs) {
//   client.timing(`webapp.db.${queryName}.execution_time`, durationMs);
// }

// // Track S3 Service Calls
// function trackS3Call(operation, durationMs) {
//   client.timing(`webapp.s3.${operation}.execution_time`, durationMs);
// }

// module.exports = { trackApiUsage, trackDatabaseQuery, trackS3Call };

// metrics.js

const client = require('./statsdClient');

const trackApiUsage = (apiPath, duration) => {
  // Increment API call count
  client.increment(`${apiPath}.count`);
  
  // Track the timing (duration in milliseconds)
  client.timing(`${apiPath}.time`, duration);
};

const trackApiError = (apiPath, duration) => {
  // Increment error count for the API path
  client.increment(`${apiPath}.errors`);
  
  // Track the timing even for failed requests
  client.timing(`${apiPath}.time`, duration);
};

// Track Database Query Execution Time
function recordExecutionTime(operation, durationMs) {
  client.timing(`webapp.database.${operation}`, durationMs);
}

module.exports = {
  trackApiUsage,
  trackApiError,
  recordExecutionTime,
};
