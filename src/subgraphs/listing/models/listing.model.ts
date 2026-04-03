import mongoose, { Schema, Document } from 'mongoose';

export interface ListingDocument extends Document {
  name: string;
  address: string;
  tenantId: string;
  createdAt: Date;
}

const ListingSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

export const ListingModel = mongoose.model<ListingDocument>('Listing', ListingSchema);

export const ListingModelToken = Symbol.for('ListingModel');