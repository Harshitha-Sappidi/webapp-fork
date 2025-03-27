const client = require('./statsdClient');

// Tracks API usage by recording the number of API calls and their response times.

const trackApiUsage = (apiPath, method) => {
  const startTime = Date.now(); // Record the start time

  return function trackResponse() {
    const duration = Date.now() - startTime; // Calculate the time taken
    const metricName = `api.${method}.${apiPath}`; // Create a metric name based on the API path and method

    client.increment(`${metricName}.count`); // Increment the API call count
    client.timing(`${metricName}.time`, duration); // Log the response time
  };
};

/**
 * Tracks S3 operations (e.g., upload, delete) by recording the count and duration.
 */
const trackS3Operation = (operation) => {
  const startTime = Date.now(); 

  return function trackResponse() {
    const duration = Date.now() - startTime; 
    client.increment(`s3.${operation}.count`);
    client.timing(`s3.${operation}.time`, duration); 
  };
};

/**
 * Tracks database queries by recording the count and duration of operations.
 */
const trackDbQuery = (operation) => {
  const startTime = Date.now(); 

  return function trackResponse() {
    const duration = Date.now() - startTime; 
    client.increment(`db.${operation}.count`); 
    client.timing(`db.${operation}.time`, duration); 
  };
};

// Export the tracking functions
module.exports = {
  trackApiUsage,
  trackS3Operation,
  trackDbQuery
};
