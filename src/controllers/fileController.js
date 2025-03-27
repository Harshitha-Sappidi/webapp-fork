const fileService = require('../services/fileService');
const healthCheckController = require('../controllers/healthController');
const { trackApiUsage, trackS3Operation } = require('../services/metrics');
const logger = require('../services/logger'); // Import Winston logger

const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};
// Upload file API handler
exports.uploadFile = async (req, res) => {
  await trackApiUsage('uploadFile', async () => {
    try {
      logger.info({
        action: 'uploadFile',
        message: `UploadFile API called, File ID: ${req.body.id}`,
      });

      const healthCheckResult = await healthCheckController.checkHealth(req, res, true);
      if (healthCheckResult.statusCode === 503) {
        logger.error({ action: 'uploadFile', message: 'Health check failed: Service Unavailable' });
        return res.status(503).set(headers).send();
      }

      const file = await trackS3Operation('upload', async () => 
        fileService.uploadFile(req.file, req.body.id)
      );

      logger.info({ action: 'uploadFile', message: `File uploaded successfully: ${file.file_name}, File ID: ${file.id}` });
      return res.status(201).json(file);
    } catch (error) {
      logger.error({ action: 'uploadFile', message: `Error uploading file: ${error.message}`, stack: error.stack });
      return res.status(400).set(headers).send();
    }
  });
};
// Get file API handler
exports.getFile = async (req, res) => {
  await trackApiUsage('getFile', async () => {
    try {
      logger.info({ action: 'getFile', message: `API called for file ID: ${req.params.id}` });

      const healthCheckResult = await healthCheckController.checkHealth(req, res, true);
      if (healthCheckResult.statusCode === 503) {
        logger.error({ action: 'getFile', message: 'Health check failed: Service Unavailable' });
        return res.status(503).set(headers).send();
      }

      const file = await fileService.getFileById(req.params.id);

      logger.info({ action: 'getFile', message: `File retrieved successfully: ${file.file_name}, File ID: ${file.id}` });
      return res.status(200).json(file);
    } catch (error) { 
      logger.error({ action: 'getFile', message: `File not found: ID ${req.params.id}`});
      return res.status(404).set(headers).send();
    }
  });
};

exports.deleteFile = async (req, res) => {
  await trackApiUsage('deleteFile', async () => {
    try {
      logger.info({ action: 'deleteFile', message: `API called for file ID: ${req.params.id}` });

      const healthCheckResult = await healthCheckController.checkHealth(req, res, true);
      if (healthCheckResult.statusCode === 503) {
        logger.warn({ action: 'deleteFile', message: 'Health check failed: Service Unavailable' });
        return res.status(503).set(headers).send();
      }
      await fileService.deleteFile(req.params.id);
      logger.info({ action: 'deleteFile', message: `File with ID ${req.params.id} deleted successfully` });
      return res.status(204).send();
    } catch (error) {
      logger.error({ action: 'deleteFile', message: `Error deleting file: ${error.message}`, stack: error.stack });
      return res.status(404).set(headers).send()
    }
  });
};
