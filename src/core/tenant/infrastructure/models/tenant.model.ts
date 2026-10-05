//src/core/tenant/infrastructure/models/tenant.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  status: string;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

const TenantSchema = new Schema<TenantDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    ownerUserId: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(TenantStatus),
      default: TenantStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

export const TenantModel = mongoose.model<TenantDocument>(
  "Tenant",
  TenantSchema
);

export default TenantModel;

export const TenantModelToken = Symbol.for("TenantModel");