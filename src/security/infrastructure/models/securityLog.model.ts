//security/infrastructure/models/securityLog.model.ts

import mongoose, {
  Schema,
  Document,
  model,
} from "mongoose";

/* =========================================
   ENUMS
========================================= */

export const SECURITY_EVENT_TYPES = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "TOKEN_EXPIRED",
  "TOKEN_INVALID",
  "TOKEN_REPLAY",
  "RISK_BLOCK",
  "RISK_CHALLENGE",
  "SUSPICIOUS_IP",
  "NEW_DEVICE",
  "PERMISSION_DENIED",
] as const;

export type SecurityEventType =
  typeof SECURITY_EVENT_TYPES[number];

export const SECURITY_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type SecurityLevel =
  typeof SECURITY_LEVELS[number];

/* =========================================
   META
========================================= */

export interface SecurityMeta {
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  provider?: string;
  reason?: string;
  requestId?: string;
  correlationId?: string;
}

/* =========================================
   DOCUMENT
========================================= */

export interface SecurityLogDocument
  extends Document {

  userId?: mongoose.Types.ObjectId;

  eventType: SecurityEventType;

  level: SecurityLevel;

  message: string;

  score?: number;

  meta?: SecurityMeta;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================
   SCHEMA
========================================= */

export const SecurityLogSchema =
  new Schema<SecurityLogDocument>(
    {
      userId: {
        type:
          Schema.Types.ObjectId,
      },

      eventType: {
        type: String,
        enum:
          SECURITY_EVENT_TYPES,
        required: true,
      },

      level: {
        type: String,
        enum:
          SECURITY_LEVELS,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      score: {
        type: Number,
      },

      meta: {
        ip: String,
        userAgent: String,
        deviceId: String,
        provider: String,
        reason: String,
        requestId: String,
        correlationId: String,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/* =========================================
   INDEXES
========================================= */

SecurityLogSchema.index({
  userId: 1,
});

SecurityLogSchema.index({
  eventType: 1,
});

SecurityLogSchema.index({
  level: 1,
});

SecurityLogSchema.index({
  createdAt: -1,
});

/* =========================================
   MODEL
========================================= */

export const SecurityLogModel =
  model<SecurityLogDocument>(
    "SecurityLog",
    SecurityLogSchema
  );

