// infrastructure/models/trusted.device.model.ts

import mongoose from "mongoose";

const trustedDeviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
});

const TrustedDeviceModel = mongoose.model("TrustedDevice", trustedDeviceSchema);

export default TrustedDeviceModel;


