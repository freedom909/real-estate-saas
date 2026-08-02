//src/subgraphs/user/models/membership.model.ts


import { UserRole } from "@/core/user/domain/userRole";
import mongoose, { Types, HydratedDocument } from "mongoose";


export interface IMembershipDB {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  ownerId: Types.ObjectId;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type MembershipDocument = HydratedDocument<IMembershipDB>;

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: Types.ObjectId, required: true, index: true },
    ownerId: { type: Types.ObjectId, required: true, index: true },

    role: {
      type: String,
      enum: Object.values(UserRole),
      // @ts-ignore
      default: Object.keys(Object.values(UserRole))[0],
      // @ts-ignore
      default: UserRole.CUSTOMER,
      required: true
    }
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, ownerId: 1 }, { unique: true });

const MembershipModel =
  mongoose.models.Membership ||
  mongoose.model<IMembershipDB>("Membership", membershipSchema);

export default MembershipModel;