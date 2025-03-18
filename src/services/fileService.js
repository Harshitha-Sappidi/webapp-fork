const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
require('dotenv').config();

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

exports.uploadFile = async (file, userId) => {
  const fileId = uuidv4();
  const s3Key = `${fileId}-${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await s3.upload(params).promise();

  const newFile = await File.create({
    id: fileId,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    s3Key,
    fileUrl: uploadResult.Location,
  });

  return newFile;
};

exports.getFileById = async (fileId) => {
  const file = await File.findByPk(fileId);
  if (!file) throw new Error('File not found');
  return file;
};

exports.deleteFile = async (fileId) => {
  const file = await File.findByPk(fileId);
  if (!file) throw new Error('File not found');

  await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: file.s3Key }).promise();
  await file.destroy();

  return { message: 'File deleted successfully' };
};
