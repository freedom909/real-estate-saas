import mongoose, { Schema, Document } from 'mongoose';

export interface HostDocument extends Document {
  name: string;
  slug: string;
  createdAt: Date;
}

const HostSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const HostModel = mongoose.model<HostDocument>('Host', HostSchema);

export const HostModelToken = Symbol.for('HostModel');