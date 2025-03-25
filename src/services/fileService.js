const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
const { trackS3Operation, trackDbQuery } = require('../services/metrics'); // Import the metrics logger
const logger = require('../services/logger'); 
require('dotenv').config();

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

  // Step 1: Generate unique file ID and S3 key
exports.uploadFile = async (file, userId) => {
  const fileId = uuidv4();
  const s3Key = `${fileId}-${file.originalname}`;

  // Step 2: Set up S3 upload parameters
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ServerSideEncryption: 'AES256',
    StorageClass: 'STANDARD',
  };

  // Step 3: Upload file to S3
  const s3Start = Date.now();
  const uploadResult = await s3.upload(params).promise();
  const s3Duration = Date.now() - s3Start;
  trackS3Operation('upload', s3Duration); // Track S3 upload operation

  logger.info(`File uploaded to S3: ${uploadResult.Location}`);

  // Step 4: Fetch metadata using headObject after upload
  const metadata = await s3.headObject({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  }).promise();

  // Step 5: Save file metadata in the database
  const dbStart = Date.now();
  const newFile = await File.create({
    id: fileId,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    fileUrl: uploadResult.Location,
    etag: metadata.ETag, 
    serverSideEncryption: metadata.ServerSideEncryption || null,
    storageClass: metadata.StorageClass || 'STANDARD',
  });
  const dbDuration = Date.now() - dbStart;
  trackDbQuery('create', dbDuration); 

  // Step 6 : Returning the simplified response
  logger.info(`File stored in DB: ${newFile.fileName}, File ID: ${newFile.id}`);
  return {
    file_name: newFile.fileName,
    id: newFile.id,
    url: newFile.fileUrl,
    upload_date: newFile.createdAt.toISOString(),
  };
};

// Get file by ID
exports.getFileById = async (fileId) => {
  const startTime = Date.now();
  const file = await File.findByPk(fileId);
  if (!file) {
    logger.warn(`File not found: File ID: ${fileId}`);
    throw new Error('File not found');
  }
  const duration = Date.now() - startTime;
  trackDbQuery('find', duration); // Track DB query execution time

  logger.info(`File fetched from DB: ${file.fileName}, File ID: ${file.id}`);
   
  // Return only the required fields
  return {
    file_name: file.fileName,
    id: file.id,
    url: file.fileUrl,
    upload_date: file.createdAt.toISOString(),
  };
};;

// Delete file by ID
exports.deleteFile = async (fileId) => {
  const startTime = Date.now();
  const file = await File.findByPk(fileId);
  if (!file) {
    logger.warn(`File not found for deletion: File ID: ${fileId}`);
    throw new Error('File not found');
  }
  const key = file.fileUrl.split('/').pop();

  const s3Start = Date.now();
  await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: key }).promise();
  const s3Duration = Date.now() - s3Start;
  trackS3Operation('delete', s3Duration); // Track S3 delete operation

  await file.destroy();
  const dbDuration = Date.now() - startTime;
  trackDbQuery('delete', dbDuration); // Track DB delete operation

  logger.info(`File deleted from DB and S3: File ID: ${fileId}`);
  return { message: 'File deleted successfully' };
};
