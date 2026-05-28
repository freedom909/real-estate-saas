import mongoose, { Schema, Document } from "mongoose"

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIAL"
  | "CANCELED"

export interface SubscriptionDocument extends Document {

  hostId: mongoose.Types.ObjectId

  plan: string

  status: SubscriptionStatus

  createdAt: Date
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    plan: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "TRIAL", "CANCELED"],
      default: "TRIAL"
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<SubscriptionDocument>(
  "Subscription",
  subscriptionSchema
)