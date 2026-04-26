import { TrustedDevice } from "../models/trustedDevice";

export interface ITrustedDeviceRepo {
  find(userId: string, deviceId: string): Promise<TrustedDevice | null>;
  create(data: Partial<TrustedDevice>): Promise<TrustedDevice>;
  updateLastUsed(id: string): Promise<void>;
}