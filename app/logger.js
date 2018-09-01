const fs = require('fs');
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const logDirectory = path.join(__dirname, 'logs');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const myFormat = winston.format.printf(info => {
	return `${info.timestamp} ${info.level}: ${info.message}`;
});

const combineFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.splat(),
	myFormat
);

const accessLogger = winston.createLogger({
	format: combineFormat,
	transports: [
		new winston.transports.DailyRotateFile({
			filename: path.join(__dirname, "logs", "access-%DATE%.log"),
			datePattern: 'YYYY-MM-DD',
			prepend: true,
			level: 'silly',
		}),
	]
});

const logger = winston.createLogger({
	format: combineFormat,
	transports: [
		new winston.transports.Console({
			level: 'silly'
		}),

		new winston.transports.DailyRotateFile({
			filename: path.join(__dirname, "logs", "error-%DATE%.log"),
			datePattern: 'YYYY-MM-DD',
			prepend: true,
			level: 'error',
		}),
		new winston.transports.DailyRotateFile({
			filename: path.join(__dirname, "logs", "combined-%DATE%.log"),
			datePattern: 'YYYY-MM-DD',
			prepend: true,
			level: 'silly',
		}),
	]
});

module.exports = logger;
module.exports.stream = {
	write: function (message, encoding) {
		logger.info(message);
		accessLogger.info(message);
	}
};