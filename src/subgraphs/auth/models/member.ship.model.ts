// src/models/Membership.model.ts
import mongoose, { Types, HydratedDocument } from "mongoose";

export type MembershipDocument = HydratedDocument<IMembershipDB>;

export interface IMembershipDB {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "OWNER" | "MEMBER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new mongoose.Schema(
  {
    _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
    tenantId: { type: Types.ObjectId, ref: "Tenant", required: true },
    userId: { type: Types.ObjectId, ref: "Identity", required: true },
    role: { type: String, enum: ["OWNER", "MEMBER", "ADMIN"], required: true },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED", "BANNED", "DELETED"], default: "ACTIVE" },
    tokenVersion: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// 复合唯一索引：同一 tenant 里一个人只能有一个 membership
membershipSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

export const MembershipModel =
  mongoose.models.Membership || mongoose.model<IMembershipDB>("Membership", membershipSchema);
export default MembershipModel;