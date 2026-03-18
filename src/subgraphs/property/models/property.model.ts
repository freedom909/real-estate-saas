import mongoose, { Schema, Document } from 'mongoose';

export interface PropertyDocument extends Document {
  name: string;
  address: string;
  tenantId: string;
  createdAt: Date;
}

const PropertySchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

export const PropertyModel = mongoose.model<PropertyDocument>('Property', PropertySchema);

export const PropertyModelToken = Symbol.for('PropertyModel');