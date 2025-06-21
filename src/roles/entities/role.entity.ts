import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from './permission.entity';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  label: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Permission.name }] })
  permissions: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
