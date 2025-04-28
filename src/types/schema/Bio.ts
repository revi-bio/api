import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './User';
import { Collections } from '../Collections';
import { IsNumber, IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';

export type BioDocument = HydratedDocument<Bio>;

@Schema({ timestamps: true })
export class Bio {
  /** Managed automatically by mongoose; the ID of the SettingContainer */
  _id: Types.ObjectId;

  @Prop({ required: true, index: { unique: true } })
  handle: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [Object], default: [] })
  pages: object[];

  @Prop({ required: true, type: Types.ObjectId, ref: Collections.User })
  user: User;

  // TODO: make a separate backgrond object that includes color, gradient, image
  @Prop({ type: Types.ObjectId })
  backgroundImage: ObjectId;

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

  /** Managed automatically by mongoose */
  createdAt: Date;

  /** Managed automatically by mongoose */
  updatedAt: Date;
}

export const BioSchema = SchemaFactory.createForClass(Bio);
