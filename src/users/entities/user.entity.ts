import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/roles/entities/role.entity';
import { Exclude } from 'class-transformer';

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  @Exclude()
  password: string;

  @Prop({ type: Types.ObjectId, ref: Role.name })
  role: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
