import mongoose, { Schema, Document } from "mongoose"
import { TenantStatus } from "../domain/entities/tenant.entity"

export interface TenantDocument extends Document {
  name: string
  slug: string
  status: string
  ownerUserId: string
  createdAt: Date
  updatedAt: Date
}

const tenantSchema = new Schema<TenantDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: { type: String, enum: Object.values(TenantStatus), default: TenantStatus.ACTIVE },
    ownerUserId: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

export const TenantModel = mongoose.model<TenantDocument>("Tenant", tenantSchema);