const fileService = require('../services/fileService');
const healthCheckController = require('../controllers/healthController');
const logger = require('../services/logger');
const { trackApiUsage, trackApiError } = require('../services/metrics'); 


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
      trackApiError(req.route.path, Date.now() - startTime);
      logger.error('Health check failed, returning 503');
      return res.status(503).set(headers).send()
    }

    const file = await fileService.uploadFile(req.file, req.body.id);
    const duration = Date.now() - startTime; // Calculate duration of the API call
    trackApiUsage(req.route.path, req.method, duration); // Track successful API usage

    logger.info(`File uploaded successfully: ${file.file_name}, File ID: ${file.id}`);
   
    return res.status(201).json(file);
  } catch (error) {
    const duration = Date.now() - startTime;
    trackApiError(req.route.path, duration); // Track API error for failed request

    logger.error(`Error uploading file: ${error.message}`);
  return res.status(400).set(headers).send()
  }
};

// Get file API handler
exports.getFile = async (req, res) => {
  const startTime = Date.now(); 
  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      trackApiError(req.route.path, Date.now() - startTime);
      logger.warn(`Health check failed, Service unavailable for fetching file: ${req.route.path}`);
      return res.status(503).set(headers).send()
    }

    const file = await fileService.getFileById(req.params.id);
    const duration = Date.now() - startTime; 

    // Log success and track API metrics
    trackApiUsage(req.route.path, req.method, duration);

    logger.info(`File fetched successfully: ${file.file_name}, File ID: ${file.id}`);
    
    return res.status(200).json(file);
  } catch (error) {
    const duration = Date.now() - startTime;
    trackApiError(req.route.path, duration);

    logger.error(`Error fetching file: ${error.message}`);
    return res.status(404).set(headers).send()
  }
};

// Delete file API handler
exports.deleteFile = async (req, res) => {
  const startTime = Date.now();
  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      trackApiError(req.route.path, Date.now() - startTime);
      return res.status(503).set(headers).send();
    }

    await fileService.deleteFile(req.params.id);
    const duration = Date.now() - startTime;
    trackApiUsage(req.route.path, req.method, duration);

    logger.info(`File deleted successfully: File ID: ${req.params.id}`);
    return res.status(204).send();
  } catch (error) {
    const duration = Date.now() - startTime;
    trackApiError(req.route.path, duration);

    logger.error(`Error deleting file: ${error.message}`);
    return res.status(404).set(headers).send();
  }
};
