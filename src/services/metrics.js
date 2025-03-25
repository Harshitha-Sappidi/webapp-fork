const client = require('./statsdClient');

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

module.exports = {
  trackApiUsage,
  trackApiError,
  trackS3Operation,
  trackDbQuery
};