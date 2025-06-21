import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FileEntity extends Document {
  @Prop({ required: true }) originalName: string;

  @Prop({ required: true }) storedName: string;

  @Prop({ required: true }) mimeType: string;

  @Prop({ required: true }) size: number;

  @Prop({ required: true }) ownerId: string;

  @Prop({ required: false }) description: string;

  @Prop({ required: true }) iv: string; // For decryption

  @Prop({ default: [] }) tags: string[];
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);
