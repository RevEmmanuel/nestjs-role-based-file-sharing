import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import 'winston-daily-rotate-file';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const baseLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, context }) => {
      return `${timestamp} [${level}] (${context || 'NestApplication'}): ${message}`;
    }),
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'rotate-%DATE%.log',
      dirname: logDir,
      zippedArchive: true,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '20d',
      maxSize: '30m',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  baseLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${level}] (${context || 'NestApplication'}): ${message}`;
        }),
      ),
    }),
  );
}
