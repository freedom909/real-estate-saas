import mongoose, { Schema, Document, Model } from "mongoose";

export interface TenantDocument extends Document {
  slug: string;
  name: string;
}

const TenantSchema = new Schema<TenantDocument>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export const TenantModel: Model<TenantDocument> =
  mongoose.model<TenantDocument>("Tenant", TenantSchema);