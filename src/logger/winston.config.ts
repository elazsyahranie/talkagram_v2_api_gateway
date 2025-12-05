import * as winston from 'winston';

// USE THIS FOR DEVELOPMENT ONLY!
// This prevents all Nest system logs from being stored inside the app.log file
const excludeNestInternalLogs = winston.format((info) => {
  const ignoredContexts = new Set([
    'RouterExplorer',
    'RoutesResolver',
    'NestFactory',
    'NestApplication',
    'InstanceLoader',
    'DependenciesScanner',
    'ModulesContainer',
  ]);

  if (typeof info.context === 'string' && ignoredContexts.has(info.context)) {
    return false;
  }

  return info;
});

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),

    // Write all logs to a file
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      // level: 'debug',
      format: winston.format.combine(
        excludeNestInternalLogs(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
