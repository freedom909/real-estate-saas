// domain/valueObjects/deviceFingerprint.ts

export class DeviceFingerprint {
  constructor(
    public readonly deviceId: string,
    public readonly userAgent: string,
    public readonly ip: string
  ) {}

  isSameDevice(other: DeviceFingerprint): boolean {
    return this.deviceId === other.deviceId;
  }

  isSameNetwork(other: DeviceFingerprint): boolean {
    return this.ip === other.ip;
  }

  isSuspicious(other: DeviceFingerprint): boolean {
    return !this.isSameDevice(other) && !this.isSameNetwork(other);
  }
}