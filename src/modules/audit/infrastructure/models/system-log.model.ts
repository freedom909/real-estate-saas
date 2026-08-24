//src/modules/domain/
import { SYSTEM_LOG_TYPES, SystemLogLevel, SystemLogType } from "@/modules/audit/domain/enums/system-log.enums";
import mongoose, { Schema, Document, model } from "mongoose";

export const SYSTEM_LOG_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR"] as const;

export interface SystemLogDocument extends Document {
  level: SystemLogLevel;
  type: SystemLogType;
  service: string;
  module?: string;
  action?: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  meta?: Record<string, any>;
  latencyMs?: number;
  stack?: string;
  createdAt: Date;
}

export const SystemLogSchema = new Schema<SystemLogDocument>(
  {
    level: {
      type: String,
      enum: SYSTEM_LOG_LEVELS,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: SYSTEM_LOG_TYPES,
      required: true,
      index: true,
    },
    service: { type: String, required: true, index: true },
    module: { type: String },
    action: { type: String },
    message: { type: String, required: true },
    correlationId: { type: String, index: true },
    requestId: { type: String, index: true },
    meta: { type: Schema.Types.Mixed },
    latencyMs: { type: Number },
    stack: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

SystemLogSchema.index({ createdAt: -1 });

export const SystemLogModel = model<SystemLogDocument>("SystemLog", SystemLogSchema);