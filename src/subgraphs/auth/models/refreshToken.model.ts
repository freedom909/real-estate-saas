import { Schema, model, HydratedDocument } from "mongoose";

export interface RefreshToken {
  jti: string;
  tokenHash: string;

  userId: string;
  sessionId: string;
  familyId: string;

  status: "active" | "used" | "revoked";

  rotatedFrom?: string | null;

  issuedAt: Date;
  expiresAt: Date;

  usedAt?: Date;
  revokedAt?: Date;
}

const refreshTokenSchema = new Schema<RefreshToken>(
{
  jti: { type: String, required: true, unique: true },

  tokenHash: { type: String, required: true },

  userId: { type: String, required: true, index: true },

  sessionId: { type: String, required: true, index: true },

  familyId: { type: String, required: true, index: true },

  status: {
    type: String,
    enum: ["active", "used", "revoked"],
    default: "active",
  },

  rotatedFrom: { type: String },

  issuedAt: { type: Date, required: true },

  expiresAt: { type: Date, required: true },

  usedAt: Date,

  revokedAt: Date,
},
{ timestamps: true }
);


export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export default model<RefreshToken>("RefreshToken", refreshTokenSchema);
