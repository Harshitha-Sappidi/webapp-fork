const { createLogger, format, transports } = require('winston');

const logFilePath = '/opt/csye6225/webapp/logs/mywebapp.log';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) =>
            JSON.stringify({
                timestamp: info.timestamp,
                level: info.level,
                message: info.message,
            })
        )
    ),
    transports: [
        new transports.File({ filename: logFilePath }),
        new transports.Console(),
    ],
});

module.exports = logger;
