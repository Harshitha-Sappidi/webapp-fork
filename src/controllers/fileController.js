const fileService = require('../services/fileService');

exports.uploadFile = async (req, res) => {
  try {
    const file = await fileService.uploadFile(req.file, req.body.id);
    return res.status(201).json(file);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    return res.status(200).json(file);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    await fileService.deleteFile(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
};
