const fileService = require('../services/fileService');

const headers = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

// Common error handling wrapper
const handleRequest = async (handler, res) => {
  try {
    await handler();
  } catch (error) {
    console.error('Error:', error);

    // Return 503 if connection issues or database is down
    if (error.code === 'ECONNREFUSED' || error.message.includes('Connection refused')) {
      return res.status(503).set(headers).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }

    // Return 404 for not found errors
    if (error.name === 'NotFoundError') {
      return res.status(404).set(headers).json({ error: error.message });
    }

    // Return 400 for any other bad request
    return res.status(400).set(headers).json({ error: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  await handleRequest(async () => {
    const file = await fileService.uploadFile(req.file, req.body.id);
    return res.status(201).set(headers).json(file);
  }, res);
};

exports.getFile = async (req, res) => {
  await handleRequest(async () => {
    const file = await fileService.getFileById(req.params.id);
    return res.status(200).set(headers).json(file);
  }, res);
};

exports.deleteFile = async (req, res) => {
  await handleRequest(async () => {
    await fileService.deleteFile(req.params.id);
    return res.status(204).set(headers).send();
  }, res);
};
