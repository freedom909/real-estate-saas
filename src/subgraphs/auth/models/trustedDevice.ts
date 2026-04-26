import { HydratedDocument, model, Schema } from "mongoose";

export interface TrustedDevice {
  id: string;
  userId: string;
  deviceId: string;
  createdAt: Date;
  lastUsedAt: Date;
  deviceName?: string;
}

const trustedDeviceSchema = new Schema<TrustedDevice>(
  {
    id: String,
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    lastUsedAt: { type: Date, default: Date.now },
    deviceName: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

trustedDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export type TrustedDeviceDocument = HydratedDocument<TrustedDevice>;

export const TrustedDeviceModel = model<TrustedDevice>(
  "TrustedDevice",
  trustedDeviceSchema
);

export default TrustedDeviceModel;
