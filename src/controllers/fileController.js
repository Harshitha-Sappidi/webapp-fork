const fileService = require('../services/fileService');
const healthCheckController = require('../controllers/healthController');
const logger = require('../services/logger');
const metrics = require('../services/metrics'); 


const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};
// Upload file API handler
exports.uploadFile = async (req, res) => {
  const startTime = Date.now();  // Start timer
  logger.info(`UploadFile API called, File ID: ${req.body.id}`);

  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      logger.error('Health check failed, returning 503');
      return res.status(503).set(headers).send()
    }

    const file = await fileService.uploadFile(req.file, req.body.id);
    const duration = Date.now() - startTime; // Calculate duration of the API call

    logger.info(`UploadFile API success, File ID: ${req.body.id}, Duration: ${duration}ms`);
    metrics.trackApiUsage('uploadFile', duration);  // Track API call metrics in CloudWatch
    return res.status(201).json(file);
  } catch (error) {
  // Log error and track error metrics
    logger.error(`UploadFile API error: ${error.message}`, { stack: error.stack });
    metrics.trackApiError('uploadFile'); // Track error metrics in CloudWatch
    return res.status(400).set(headers).send()
  }
};

// Get file API handler
exports.getFile = async (req, res) => {
  const startTime = Date.now(); 
  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      return res.status(503).set(headers).send()
    }

    const file = await fileService.getFileById(req.params.id);
    const duration = Date.now() - startTime; 

    // Log success and track API metrics
    logger.info(`GetFile API success, File ID: ${req.params.id}, Duration: ${duration}ms`);
    metrics.trackApiUsage('getFile', duration); 

    return res.status(200).json(file);
  } catch (error) {
    logger.error(`GetFile API error: ${error.message}`, { stack: error.stack });
    metrics.trackApiError('getFile');
    return res.status(404).set(headers).send()
  }
};

// Delete file API handler
exports.deleteFile = async (req, res) => {
  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      return res.status(503).set(headers).send()
    }

    await fileService.deleteFile(req.params.id);

    const duration = Date.now() - startTime;  

    logger.info(`DeleteFile API success, File ID: ${req.params.id}, Duration: ${duration}ms`);
    metrics.trackApiUsage('deleteFile', duration);  // Track API call metrics in CloudWatch

    return res.status(204).send();
  } catch (error) {
    logger.error(`DeleteFile API error: ${error.message}`, { stack: error.stack });
    metrics.trackApiError('deleteFile');  
    
    return res.status(404).set(headers).send()
  }
};
