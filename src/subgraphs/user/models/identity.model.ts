import mongoose, { Schema, Document, Model } from "mongoose";

export interface IdentityDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: "EMAIL" | "PHONE" | "USERNAME";
  value: string;
  isPrimary: boolean;
  status: "ACTIVE" | "VERIFIED" | "DISABLED";
}

const IdentitySchema = new Schema<IdentityDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["EMAIL", "PHONE", "USERNAME"],
      required: true
    },

    value: {
      type: String,
      required: true
    },

    isPrimary: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["ACTIVE", "VERIFIED", "DISABLED"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

IdentitySchema.index({ type: 1, value: 1 }, { unique: true });

export const IdentityModel: Model<IdentityDocument> =
  mongoose.model<IdentityDocument>("Identity", IdentitySchema);

export default IdentityModel;