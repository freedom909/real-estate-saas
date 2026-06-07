import mongoose, { Schema, Document } from "mongoose"

export type Role =
  | "OWNER"
  | "ADMIN"
  | "AGENT"
  | "CUSTOMER"

export type MembershipStatus =
  | "ACTIVE"
  | "INVITED"
  | "SUSPENDED"

export interface MembershipDocument extends Document {

  userId: mongoose.Types.ObjectId

  hostId: mongoose.Types.ObjectId

  role: Role

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

    hostId: {
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

export default mongoose.model<MembershipDocument>(
  "Membership",
  membershipSchema
)