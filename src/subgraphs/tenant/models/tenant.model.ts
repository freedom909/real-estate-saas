import mongoose, { Schema, Document } from "mongoose"

export interface TenantDocument extends Document {

  name: string

  slug: string

  createdAt: Date
}

const tenantSchema = new Schema<TenantDocument>(
  {
    name: {
      type: String,
      required: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<TenantDocument>(
  "Tenant",
  tenantSchema
)