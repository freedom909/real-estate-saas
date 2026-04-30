// infrastructure/models/challenge.model.ts
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: String,
  otpCode: String,
  expiresAt: Date,
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