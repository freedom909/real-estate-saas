// membership.model.ts
// tenant.infrastructure.models.membership.model.ts

import mongoose, { Schema, Document } from "mongoose"
import { UserRole } from "../../../user/domain/userRole"

export type MembershipStatus =
  | "ACTIVE"
  | "INVITED"
  | "SUSPENDED"

export interface MembershipDocument extends Document {

  userId: mongoose.Types.ObjectId

  ownerId: mongoose.Types.ObjectId

  role: UserRole

  status: MembershipStatus

  createdAt: Date
}

const membershipSchema = new Schema<MembershipDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "AGENT", "CUSTOMER"],
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INVITED", "SUSPENDED"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
)

const MembershipModel = mongoose.model<MembershipDocument>(
  "Membership",
  membershipSchema
)

export default MembershipModel