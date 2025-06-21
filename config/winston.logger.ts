import { LoggerService } from '@nestjs/common';
import { baseLogger } from './winston.base-logger';

export class WinstonLogger implements LoggerService {
  constructor(private readonly context: string = 'App') {}

  log(message: string) {
    baseLogger.info(message, { context: this.context });
  }

  error(message: string, trace?: string) {
    baseLogger.error(`${message}${trace ? ' - ' + trace : ''}`, {
      context: this.context,
    });
  }

  warn(message: string) {
    baseLogger.warn(message, { context: this.context });
  }

  debug(message: string) {
    baseLogger.debug(message, { context: this.context });
  }

  verbose(message: string) {
    baseLogger.verbose(message, { context: this.context });
  }

  info(message: string) {
    baseLogger.info(message, { context: this.context });
  }
}
