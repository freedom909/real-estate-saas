//src/subgraphs/user/models/membership.model.ts

import mongoose, { Types, HydratedDocument } from "mongoose";
import { Role } from "../../../domain/user/types/role";

export interface IMembershipDB {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  hostId: Types.ObjectId;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type MembershipDocument = HydratedDocument<IMembershipDB>;

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: Types.ObjectId, required: true, index: true },
    hostId: { type: Types.ObjectId, required: true, index: true },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.CUSTOMER,
      required: true
    }
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, hostId: 1 }, { unique: true });

const MembershipModel =
  mongoose.models.Membership ||
  mongoose.model<IMembershipDB>("Membership", membershipSchema);

export default MembershipModel;