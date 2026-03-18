import mongoose, { Schema, Document } from 'mongoose';

export interface AuditLogDocument extends Document {
  action: string;
  userId: string;
  resourceId: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema({
  action: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true, index: true },
  resourceId: { type: Schema.Types.ObjectId, required: true, index: true },
  timestamp: { type: Date, default: Date.now }
});

export const AuditLogModel = mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);

export const AuditLogModelToken = Symbol.for('AuditLogModel');