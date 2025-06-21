import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from 'src/audits/audits.service';
import { AuditLog, AuditLogSchema } from 'src/audits/entities/audit-log.entity';

import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
