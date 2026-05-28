import { TrustedDevice } from "../entities/trustedDevice.entity";



export interface ITrustedDeviceRepo {
  find(userId: string, deviceId: string): Promise<TrustedDevice | null>;
  create(data: Partial<TrustedDevice>): Promise<TrustedDevice>;
  updateLastUsed(id: string, deviceId: string): Promise<void>;
}