import mongoose from "mongoose";

export interface IdentityDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: "EMAIL" | "PHONE" | "USERNAME";
  value: string;
  isPrimary: boolean;
  status: "ACTIVE" | "VERIFIED" | "DISABLED";
}

