// infrastructure/models/identity.model.ts

import { Schema, model } from "mongoose";

const IdentitySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    email: { type: String }
  },
  { timestamps: true }
);

// ⭐ 核心唯一索引（防重复绑定）
IdentitySchema.index(
  { provider: 1, providerId: 1 },
  { unique: true }
);

export const IdentityModel = model("Identity", IdentitySchema);