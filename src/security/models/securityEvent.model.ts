// src/security/models/securityEvent.model.ts

import { Schema, model } from "mongoose";

const SecurityEventSchema = new Schema(
  {
    actor: {
      userId: { type: String, index: true },
    },

    action: { type: String, required: true, index: true },

    resource: {
      type: { type: String },
      id: { type: String },
    },

    context: {
      ip: { type: String, index: true },
      userAgent: { type: String },
      fingerprint: { type: String, index: true },
    },

    payload: {
      type: Schema.Types.Mixed,
    },

    assessment: {
      riskScore: { type: Number, index: true },
      suggestedAction: { type: String, index: true },
      reason: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const SecurityEventModel = model(
  "SecurityEvent",
  SecurityEventSchema
);