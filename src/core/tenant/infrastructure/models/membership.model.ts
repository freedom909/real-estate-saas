//src/core/tenant/infrastructure/models/membership.model.ts


import mongoose, { Schema, Document } from "mongoose";
import { MembershipRole } from "@/core/shared/domain/role";
import { MembershipStatus } from "../../domain/entities/membership";

export interface MembershipDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<MembershipDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: Object.values(MembershipRole),
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "SUSPENDED", "REMOVED"],
      default: "ACTIVE",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

membershipSchema.index(
  { userId: 1, tenantId: 1 },
  { unique: true }
);

const MembershipModel =
  (mongoose.models.Membership as mongoose.Model<MembershipDocument>) ||
  mongoose.model<MembershipDocument>(
    "Membership",
    membershipSchema
  );

export default MembershipModel;