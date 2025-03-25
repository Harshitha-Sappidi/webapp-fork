// // metrics.js

// const client = require('./statsdClient');

// const trackApiUsage = (apiPath, duration) => {
//   // Increment API call count
//   client.increment(`${apiPath}.count`);
  
//   // Track the timing (duration in milliseconds)
//   client.timing(`${apiPath}.time`, duration);
// };

// const trackApiError = (apiPath, duration) => {
//   // Increment error count for the API path
//   client.increment(`${apiPath}.errors`);
  
//   // Track the timing even for failed requests
//   client.timing(`${apiPath}.time`, duration);
// };

// // Track Database Query Execution Time
// function recordExecutionTime(operation, durationMs) {
//   client.timing(`webapp.database.${operation}`, durationMs);
// }

// module.exports = {
//   trackApiUsage,
//   trackApiError,
//   recordExecutionTime,
// };


import client from './statsdClient';

const trackApiUsage = (apiPath, method, durationMs) => {
  const metricName = `api.${method}.${apiPath}`;
  client.increment(`${metricName}.count`);
  client.timing(`${metricName}.time`, durationMs);
};

const trackApiError = (apiPath, method, durationMs) => {
  const metricName = `api.${method}.${apiPath}`;
  client.increment(`${metricName}.errors`);
  client.timing(`${metricName}.time`, durationMs);
};

const trackS3Operation = (operation, durationMs) => {
  client.increment(`s3.${operation}.count`);
  client.timing(`s3.${operation}.time`, durationMs);
};

const trackDbQuery = (operation, durationMs) => {
  client.increment(`db.${operation}.count`);
  client.timing(`db.${operation}.time`, durationMs);
};

export { trackApiUsage, trackApiError, trackS3Operation, trackDbQuery };