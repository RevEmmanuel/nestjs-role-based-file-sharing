import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  action: string; // e.g. "upload", "update", "list"

  @Prop()
  resourceId?: string; // e.g. File ID

  @Prop()
  resourceType?: string; // e.g. "File"

  @Prop({ required: true })
  performedBy: string; // user ID or email

  @Prop({ type: Object })
  metadata?: Record<string, any>; // optional context
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
