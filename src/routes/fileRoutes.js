const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/v1/file', upload.single('file'), fileController.uploadFile);
router.get('/v1/file/:id', fileController.getFile);
router.delete('/v1/file/:id', fileController.deleteFile);

module.exports = router;
