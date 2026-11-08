//src/core/audit/infrastructure/models/system-log.model.ts


import{ Schema, Document, model } from "mongoose";
import { SystemLogLevel, SystemLogType } from "../../domain/entities/systemLog.entity";
import { SYSTEM_LOG_LEVELS, SYSTEM_LOG_TYPES } from "../../domain/enums/system-log.enums";

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