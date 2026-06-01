import mongoose, { Schema, Document } from "mongoose"

export interface AuditLogDocument extends Document {

  userId?: mongoose.Types.ObjectId
  action: string
  resourceId: string
  createdAt: Date,
  meta:{
    deviceId,
    provider,
    ip,
    userAgent
  }
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

    resourceId: {
      type: String,
      required: true
    },
    meta: {
      deviceId: {
        type: String,
      },
      ip: {
        type: String,
      },
      userAgent: {
        type: String,
      },
   
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
)

export default mongoose.model<AuditLogDocument>(
  "AuditLog",
  auditLogSchema
)