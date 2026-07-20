import winston from 'winston';
import path from 'path';
import 'dotenv/config';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  },
};

winston.addColors(customLevels.colors);

export class LoggerConfig {
  private static readonly isProduction = process.env.NODE_ENV === 'production';

  private static readonly consoleFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `[${timestamp}] ${level}: ${stack || message} ${metaStr}`;
    }),
  );

  private static readonly fileFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json(),
  );

  private static instance: winston.Logger;

  private static build(): winston.Logger {
    const logger = winston.createLogger({
      levels: customLevels.levels,
      level: LoggerConfig.isProduction ? 'info' : 'debug',
      format: LoggerConfig.fileFormat,
      defaultMeta: { service: 'RTku-api' },
      transports: [
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join('logs', 'combined.log'),
        }),
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join('logs', 'exceptions.log'),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join('logs', 'rejections.log'),
        }),
      ],
    });

    if (!LoggerConfig.isProduction) {
      logger.add(
        new winston.transports.Console({
          format: LoggerConfig.consoleFormat,
        }),
      );
    }

    return logger;
  }

  static getInstance(): winston.Logger {
    if (!LoggerConfig.instance) {
      LoggerConfig.instance = LoggerConfig.build();
    }
    return LoggerConfig.instance;
  }
}

export const logger = LoggerConfig.getInstance();
