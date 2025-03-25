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
