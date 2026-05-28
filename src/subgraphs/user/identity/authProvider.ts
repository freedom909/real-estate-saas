// AuthProvider.model.ts

import mongoose, { Types } from "mongoose";

export interface IAuthProviderDB {
  _id: Types.ObjectId;
  identityId: Types.ObjectId;
  provider: "GOOGLE" | "APPLE" | "GITHUB";
  providerUserId: string;
  emailFromProvider: string;
  createdAt: Date;
  updatedAt: Date;
}
const authProviderSchema = new mongoose.Schema({
  _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
  identityId: { type: Types.ObjectId, ref: "Identity", required: true },
  provider: { type: String, enum: ["GOOGLE", "APPLE", "GITHUB"], required: true },
  providerUserId: { type: String, required: true },
  emailFromProvider: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

authProviderSchema.index({ providerUserId: 1 }, { unique: true });

export default mongoose.models.AuthProvider ||
  mongoose.model<IAuthProviderDB>("AuthProvider", authProviderSchema);