import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SettingContainer } from './SettingContainer';
import { Collections } from '../Collections';
import { ObjectId } from 'mongodb';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  /** Managed automatically by mongoose; the ID of the User */
  _id: Types.ObjectId;

  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true, index: { unique: true } })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: Collections.Setting })
  settingContainer: SettingContainer;

  @Prop({ type: Types.ObjectId })
  avatar: ObjectId;

  /**
   * The property we have for helping database migrations.
   * If we ever update the schema definition, we can increment
   * this field on every newly generated document. This way,
   * we'll have an easy way of obviously differentiating between
   * multiple schema definitions in the same collection.
   */
  @Prop({ required: true, default: 0 })
  _schemaVersion: number;

  @Prop({ default: [], type: [Object] })
  validations?: { emailVerification?: string }[];

  /** Managed automatically by mongoose */
  createdAt: Date;

  /** Managed automatically by mongoose */
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
