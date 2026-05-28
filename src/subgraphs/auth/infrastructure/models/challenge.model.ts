// infrastructure/models/challenge.model.ts
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: String,
  otpCode: String,
  expiresAt: Date,
  deviceId: String,
  status: {
    type: String,
    enum: ["PENDING", "VERIFIED", "EXPIRED"],
    default: "PENDING",
  },
  type: {
    type: String,
    enum: ["OTP", "SMS"],
    default: "OTP",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ChallengeModel = mongoose.model("Challenge", schema);