import { Global, Module } from '@nestjs/common';
import { WinstonLogger } from '../../config/winston.logger';

@Global() // makes this logger available app-wide without re-importing
@Module({
  providers: [WinstonLogger],
  exports: [WinstonLogger],
})
export class LoggerModule {}
