const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
const metrics = require('../services/metrics');
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
  metrics.recordExecutionTime('s3.upload', s3Duration);

  // Step 4: Fetch metadata using headObject after upload
  const metadataStart = Date.now();
  const metadata = await s3.headObject({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  }).promise();
  const metadataDuration = Date.now() - metadataStart;
  metrics.recordExecutionTime('s3.headObject', metadataDuration);


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
  metrics.recordExecutionTime('database.query', dbDuration);

  // Step 6 : Returning the simplified response
  return {
    file_name: newFile.fileName,
    id: newFile.id,
    url: newFile.fileUrl,
    upload_date: newFile.createdAt.toISOString(),
  };
};

// Get file by ID
exports.getFileById = async (fileId) => {
  const file = await File.findByPk(fileId);
  if (!file) throw new Error('File not found');

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
  const file = await File.findByPk(fileId);
  if (!file) throw new Error('File not found');

  const key = file.fileUrl.split('/').pop();

  const s3Start = Date.now();
  await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: key }).promise();
  const s3Duration = Date.now() - s3Start;
  metrics.recordExecutionTime('s3.deleteObject', s3Duration);

  // Start Timer for Database Delete
  const dbDeleteStart = Date.now();
  await file.destroy();
  const dbDeleteDuration = Date.now() - dbDeleteStart;
  metrics.recordExecutionTime('database.query', dbDeleteDuration);

  return { message: 'File deleted successfully' };
};
