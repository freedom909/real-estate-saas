// domain/entities/trustedDevice.entity.ts

import { DeviceFingerprint } from "../valueObjects/deviceFingerprint";

export class TrustedDevice {
  constructor(
    public readonly userId: string,
    public readonly fingerprint: DeviceFingerprint,
    public readonly createdAt: Date,
    public lastUsedAt: Date 
  ) {}

  // ✅ 是否同一设备
  isSameDevice(fingerprint: DeviceFingerprint): boolean {
    return this.fingerprint.isSameDevice(fingerprint);
  }

  // ✅ 是否同一网络
  isSameNetwork(fingerprint: DeviceFingerprint): boolean {
    return this.fingerprint.isSameNetwork(fingerprint);
  }

  // ✅ 是否可疑（核心风控逻辑）
  isSuspicious(fingerprint: DeviceFingerprint): boolean {
    return this.fingerprint.isSuspicious(fingerprint);
  }

  // ✅ 是否过期（比如30天）
  isExpired(now: Date = new Date()): boolean {
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    return now.getTime() - this.createdAt.getTime() > THIRTY_DAYS;
  }

  // ✅ 更新使用时间（行为）
  markUsed() {
    this.lastUsedAt = new Date();
  }
}