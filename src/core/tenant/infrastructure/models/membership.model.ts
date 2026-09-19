// membership.model.ts
// tenant.infrastructure.models.membership.model.ts

import mongoose, { Schema, Document } from "mongoose"
import { UserRole } from "../../../user/domain/userRole"
import { MembershipStatus } from "../../domain/entities/membership"

export interface MembershipDocument extends Document {

  userId: mongoose.Types.ObjectId

  tenantId: mongoose.Types.ObjectId

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

    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["OWNER", "AGENT", "AGENT", "HOST","MODERATOR","STAFF"],
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INVITED", "SUSPENDED", "ARCHIVED"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
)

const MembershipModel: mongoose.Model<MembershipDocument> =
  (mongoose.models.Membership as mongoose.Model<MembershipDocument>) ||
  mongoose.model<MembershipDocument>("Membership", membershipSchema);

export default MembershipModel;