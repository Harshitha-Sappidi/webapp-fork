const client = require('./statsdClient');

const formatApiPath = (apiPath) => apiPath.replace(/\/:[^/]+/g, "/{id}"); // Replace :id with {id}

/**
 * Tracks API usage, specifying the API path, method, and controller name.
 */
const trackApiUsage = (apiPath, method, durationMs) => {
  let formattedPath = formatApiPath(apiPath);

  // Force all GET and DELETE requests for files to be logged under a single path
  if ((method === "GET" || method === "DELETE") && formattedPath.startsWith("/v1/file/")) {
    formattedPath = "/v1/file/{id}/count";
  }
  const metricName = `api.${method}.${formattedPath.replace(/\//g, '.')}`;
  
  client.increment(`${metricName}.count`);
  client.timing(`${metricName}.time`, durationMs);
};

const trackS3Operation = (operation, durationMs) => {
  client.increment(`s3_bucket.${operation}.count`);
  client.timing(`s3_bucket.${operation}.time`, durationMs);
};

const trackDbQuery = (operation, durationMs) => {
  client.increment(`database.${operation}.count`);
  client.timing(`database.${operation}.time`, durationMs);
};

module.exports = {
  trackApiUsage,
  trackS3Operation,
  trackDbQuery
};
