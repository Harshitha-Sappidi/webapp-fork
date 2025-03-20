const fileService = require('../services/fileService');
const healthCheckController = require('../controllers/healthController');
const { response } = require('../app');

const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

exports.uploadFile = async (req, res) => {
  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      return res.status(503).set(headers).send()
    }

    const file = await fileService.uploadFile(req.file, req.body.id);
    return res.status(201).json(file);
  } catch (error) {
    return res.status(400).set(headers).send()
  }
};

exports.getFile = async (req, res) => {
  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      return res.status(503).set(headers).send()
    }

    const file = await fileService.getFileById(req.params.id);
    return res.status(200).json(file);
  } catch (error) {
    return res.status(404).set(headers).send()
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const healthCheckResult = await healthCheckController.checkHealth(req, res, true);

    if (healthCheckResult.statusCode === 503) {
      return res.status(503).set(headers).send()
    }

    await fileService.deleteFile(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(404).set(headers).send()
  }
};
