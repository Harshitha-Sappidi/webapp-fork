const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
const { trackDbQuery, trackS3Operation } = require('../services/metrics');
const logger = require('../services/logger');
require('dotenv').config();

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

// Upload File
exports.uploadFile = async (file, userId) => {
  const fileId = uuidv4();
  const s3Key = `${fileId}-${file.originalname}`;

  try {
    logger.info({ action: 'uploadFile', message: `Uploading file: ${file.originalname}` });

    // Upload file to S3 with tracking
    const uploadResult = await trackS3Operation('upload', async () =>
      s3.upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
        StorageClass: 'STANDARD',
      }).promise()
    );
    logger.info(`File uploaded to S3: ${uploadResult.Location}`);

    // Fetch metadata using headObject after upload
    const metadata = await trackS3Operation('headObject', async () =>
      s3.headObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
      }).promise()
    );

    // Save file metadata in the database with query tracking
    const newFile = await trackDbQuery('insertFile', async () =>
      File.create({
        id: fileId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        fileUrl: uploadResult.Location,
        etag: metadata.ETag,
        serverSideEncryption: metadata.ServerSideEncryption || null,
        storageClass: metadata.StorageClass || 'STANDARD',
      })
    );

    logger.info({ action: 'uploadFile', message: `File uploaded successfully to S3: ${newFile.fileName}, File ID: ${newFile.id}` });

    return {
      file_name: newFile.fileName,
      id: newFile.id,
      url: newFile.fileUrl,
      upload_date: newFile.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error({ action: 'uploadFile', message: `Error uploading file to S3: ${error.message}`, stack: error.stack });
    throw error;
  }
};

// Get File by ID
exports.getFileById = async (fileId) => {
  try {
    logger.info({ action: 'getFileById', message: `Fetching file details for ID: ${fileId}` });

    const file = await trackDbQuery('fetchFileById', async () =>
      File.findByPk(fileId)
    );

    if (!file) {
      logger.warn({ action: 'getFileById', message: `File not found: ID ${fileId}` });
      throw new Error('File not found');
    }

    logger.info({ action: 'getFileById', message: `File retrieved from DB successfully: ${file.fileName}, File ID: ${file.id}` });

    return {
      file_name: file.fileName,
      id: file.id,
      url: file.fileUrl,
      upload_date: file.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error({ action: 'getFileById', message: `Error retrieving file: ${error.message}`, stack: error.stack });
    throw error;
  }
};

// Delete File by ID
exports.deleteFile = async (fileId) => {
  try {
    logger.info({ action: 'deleteFile', message: `Deleting file with ID: ${fileId}` });

    const file = await trackDbQuery('fetchFileForDeletion', async () =>
      File.findByPk(fileId)
    );

    if (!file) {
      logger.warn({ action: 'deleteFile', message: `File not found: ID ${fileId}` });
      throw new Error('File not found');
    }

    const key = file.fileUrl.split('/').pop();

    // Delete from S3 with tracking
    await trackS3Operation('deleteObject', async () =>
      s3.deleteObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      }).promise()
    );

    // Delete from DB with tracking
    await trackDbQuery('deleteFileRecord', async () => file.destroy());

    logger.info({ action: 'deleteFile', message: `File deleted successfully: ID ${fileId}` });

    return { message: 'File deleted successfully' };
  } catch (error) {
    logger.error({ action: 'deleteFile', message: `Error deleting file from Database: ${error.message}`, stack: error.stack });
    throw error;
  }
};
