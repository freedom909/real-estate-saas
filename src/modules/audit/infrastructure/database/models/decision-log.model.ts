import { DECISION_SOURCE, DecisionSource } from "@/modules/audit/domain/enums/decision-log.enums";
import mongoose, { Schema, Document, model } from "mongoose";



export interface DecisionLogDocument extends Document {
  meta: {
    executionId: string;
    correlationId?: string;
    requestId?: string;
    sessionId?: string;
  };
  actor: {
    userId?: mongoose.Types.ObjectId;
    tenantId?: string;
    ownerId?: string;
    role?: string;
  };
  input: {
    rawMessage: string;
    source: DecisionSource;
    locale?: string;
  };
  decision: {
    status: string;
    approved: boolean;
    confidence: number;
    reason?: string;
    riskLevel?: string;
    requiresHumanReview: boolean;
  };
  createdAt: Date;
}

export const DecisionLogSchema = new Schema<DecisionLogDocument>(
  {
    meta: {
      executionId: { type: String, required: true, index: true },
      correlationId: { type: String, index: true },
      requestId: { type: String, index: true },
      sessionId: { type: String, index: true },
    },
    actor: {
      userId: { type: Schema.Types.ObjectId },
      tenantId: { type: String, index: true },
      ownerId: { type: String, index: true },
      role: { type: String },
    },
    input: {
      rawMessage: { type: String, required: true },
      source: { type: String, enum: DECISION_SOURCE, required: true },
      locale: { type: String },
    },
    decision: {
      status: { type: String, required: true },
      approved: { type: Boolean, required: true },
      confidence: { type: Number, required: true },
      reason: { type: String },
      riskLevel: { type: String },
      requiresHumanReview: { type: Boolean, default: false },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

DecisionLogSchema.index({ createdAt: -1 });

export const DecisionLogModel = model<DecisionLogDocument>("DecisionLog", DecisionLogSchema);