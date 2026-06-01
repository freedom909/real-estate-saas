import mongoose, { Schema, Document } from 'mongoose';

export interface AuditLogDocument extends Document {
  action: string;
  userId: string;
  resourceId: string;
  metadata: string;
  timestamp: Date;
}

const Model = new Schema({
  action: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true, index: true },
  resourceId: { type: Schema.Types.ObjectId, required: true, index: true },
  metadata: { type: String },
  timestamp: { type: Date, default: Date.now }, 
});

const AuditModel = mongoose.model<AuditLogDocument>('AuditLog', Model);

export default AuditModel;