// security/domain/entities/trustedDeviceProps.ts

export interface TrustedDeviceProps {
  userId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  createdAt?: Date;
  lastUsedAt?: Date;
}