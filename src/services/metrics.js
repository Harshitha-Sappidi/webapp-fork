const statsd = require('./statsdClient');

/**
 * Tracks API call count and duration.
 */
const trackApiUsage = async (apiName, func) => {
    statsd.increment(`api.${apiName}.count`); // Increment API call count
    
    const startTime = Date.now();
    try {
        return await func();
    } finally {
        const duration = Date.now() - startTime;
        statsd.timing(`api.${apiName}.duration`, duration); // Log API duration
    }
};

/**
 * Tracks database query execution time.
 */
const trackDbQuery = async (queryName, func) => {
    const startTime = Date.now();
    try {
        return await func();
    } finally {
        const duration = Date.now() - startTime;
        statsd.timing(`database.${queryName}.duration`, duration); // Log DB query duration
    }
};

/**
 * Tracks S3 operation execution time.
 */
const trackS3Operation = async (operationName, func) => {
    const startTime = Date.now();
    try {
        return await func();
    } finally {
        const duration = Date.now() - startTime;
        statsd.timing(`s3.${operationName}.duration`, duration); // Log S3 operation duration
    }
};

module.exports = {
    trackApiUsage,
    trackDbQuery,
    trackS3Operation
};
