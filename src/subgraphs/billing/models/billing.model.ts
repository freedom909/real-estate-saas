import mongoose, { Schema, Document } from 'mongoose';

export interface BillingAccountDocument extends Document {
  hostId: string;
  status: string;
  balance: number;
  createdAt: Date;
}

const BillingAccountSchema = new Schema({
  hostId: { type: Schema.Types.ObjectId, required: true, unique: true },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], default: 'ACTIVE' },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const BillingAccountModel = mongoose.model<BillingAccountDocument>('BillingAccount', BillingAccountSchema);

export const BillingAccountModelToken = Symbol.for('BillingAccountModel');