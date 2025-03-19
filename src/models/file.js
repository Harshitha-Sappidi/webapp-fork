const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  s3Key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  etag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contentLength: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lastModified: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  serverSideEncryption: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = File;