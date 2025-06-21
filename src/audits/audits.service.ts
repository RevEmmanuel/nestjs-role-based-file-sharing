import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from 'src/audits/entities/audit-log.entity';
import { AuditEvent } from 'src/audits/dto/audit-event';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  @OnEvent('audit.log')
  async handleAuditEvent(payload: AuditEvent) {
    await this.auditModel.create(payload);
  }
}
