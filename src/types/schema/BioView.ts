import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './User';
import { Collections } from '../Collections';
import { IsNumber, IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';
import { Bio } from './Bio';

export type BioVisitContainerDocument = HydratedDocument<BioVisitContainer>;

export interface Visitor {
  visitorId: string;
  countryCode: string;
  clicks: string[];
  referrer?: string;

  // random number between 0-10.000
  challengeAnswer: number;
  challengeCompleted?: boolean;
}

/**
 *  Contains every visit that occurred on a specific date (createdAt)
 */
@Schema({ timestamps: true })
export class BioVisitContainer {
  /** Managed automatically by mongoose; the ID of the BioVisitor */
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Collections.Bio })
  bio: Bio;

  @Prop({ required: true, type: Array, default: [] })
  visits: Visitor[];

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

export const BioVisitContainerSchema = SchemaFactory.createForClass(BioVisitContainer);
