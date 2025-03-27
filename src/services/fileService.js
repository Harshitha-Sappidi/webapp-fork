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

  try {
    // Step 3: Upload file to S3
    const uploadResult = await s3.upload(params).promise();
    trackS3Operation('upload');

    logger.info(`File uploaded successfully to S3: ${uploadResult.Location}`);

    // Step 4: Fetch metadata using headObject after upload
    const metadata = await s3.headObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    }).promise();

    // Step 5: Save file metadata in the database
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
    trackDbQuery('create');

    logger.info(`File metadata stored in DB: ${newFile.fileName}, File ID: ${newFile.id}`);

    // Step 6: Returning the simplified response
    return {
      file_name: newFile.fileName,
      id: newFile.id,
      url: newFile.fileUrl,
      upload_date: newFile.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error(`Error uploading file to S3 or saving to DB: ${error.message}`, { stack: error.stack });
    throw new Error('File upload failed');
  }
};

// Get file by ID
exports.getFileById = async (fileId) => {
  try {
    const file = await File.findByPk(fileId);
    if (!file) {
      logger.warn(`File not found in DB: File ID: ${fileId}`);
      throw new Error('File not found');
    }
    trackDbQuery('find');

    logger.info(`File fetched from DB: ${file.fileName}, File ID: ${file.id}`);
    
    // Return only the required fields
    return {
      file_name: file.fileName,
      id: file.id,
      url: file.fileUrl,
      upload_date: file.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error(`Error fetching file by ID: ${fileId}`, { stack: error.stack });
    throw error; 
  }
};

// Delete file by ID
exports.deleteFile = async (fileId) => {
  try {
    const file = await File.findByPk(fileId);
    if (!file) {
      logger.warn(`File not found for deletion in DB: File ID: ${fileId}`);
      throw new Error('File not found');
    }
    const key = file.fileUrl.split('/').pop();

    // Track DB query for file deletion check
    trackDbQuery('find');

    // S3 delete operation
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: key }).promise();
    trackS3Operation('delete');

    // Delete file from DB
    await file.destroy();
    trackDbQuery('delete');

    logger.info(`File successfully deleted from DB and S3: File ID: ${fileId}`);
    return { message: 'File deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting file: File ID: ${fileId}`, { stack: error.stack });
    throw new Error('File deletion failed');
  }
};
