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
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  storageClass: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  etag: {
    type: DataTypes.STRING,
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