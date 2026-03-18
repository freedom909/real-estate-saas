import mongoose, { Schema, Document } from "mongoose"

export interface AuditLogDocument extends Document {

  userId?: mongoose.Types.ObjectId

  action: string

  resource: string

  ip?: string

  createdAt: Date
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId
    },

    action: {
      type: String,
      required: true
    },

    resource: {
      type: String,
      required: true
    },

    ip: String
  },
  {
    timestamps: true
  }
)

export default mongoose.model<AuditLogDocument>(
  "AuditLog",
  auditLogSchema
)