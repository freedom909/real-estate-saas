import { Document } from "mongoose"

export interface TenantDocument extends Document {
  name: string
  slug: string
  status: string
  ownerUserId: string
  createdAt: Date
  updatedAt: Date
}