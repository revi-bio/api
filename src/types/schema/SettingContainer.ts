import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SettingContainerDocument = HydratedDocument<SettingContainer>;

@Schema({ timestamps: true })
export class SettingContainer {
    /** Managed automatically by mongoose; the ID of the SettingContainer */
    _id: Types.ObjectId;



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

export const SettingContainerSchema = SchemaFactory.createForClass(SettingContainer);