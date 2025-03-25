const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logFilePath = '/opt/csye6225/webapp/logs/mywebapp.log';

// Ensure log directory exists
const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Winston Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: logFilePath })
    ]
});

module.exports = logger;
