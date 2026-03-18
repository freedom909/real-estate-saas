import mongoose, { Schema, Document } from 'mongoose';

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  createdAt: Date;
}

const TenantSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const TenantModel = mongoose.model<TenantDocument>('Tenant', TenantSchema);

export const TenantModelToken = Symbol.for('TenantModel');