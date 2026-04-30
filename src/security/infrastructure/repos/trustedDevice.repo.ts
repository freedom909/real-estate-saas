import { inject, injectable } from "tsyringe";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { ITrustedDeviceRepo } from "../../domain/repos/ITrustedDeviceRepo";
import { TrustedDevice } from "../../domain/entities/trustedDevice.entity";
import { DeviceFingerprint } from "../../domain/valueObjects/deviceFingerprint";
import TrustedDeviceModel from "@/security/infrastructure/models/trusted.device.model";
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";


@injectable()
export default class TrustedDeviceRepository implements ITrustedDeviceRepo {
  constructor(
    @inject(TOKENS_SECURITY.models.trustedDevice)
    private model: any
  ) {}

  async find(userId: string, deviceId: string): Promise<TrustedDevice | null> {
    const doc = await this.model.findOne({ userId, deviceId }).lean();
    if (!doc) return null;

    return new TrustedDevice(
      doc.userId,
      new DeviceFingerprint(doc.deviceId, doc.userAgent, doc.ip),
      doc.createdAt,
      doc.lastUsedAt
    );
  }

  async create(device: TrustedDevice): Promise<TrustedDevice> {
    const { fingerprint } = device;

    const doc = await this.model.create({
      userId: device.userId,
      deviceId: fingerprint.deviceId,
      ip: fingerprint.ip,
      userAgent: fingerprint.userAgent,
      createdAt: device.createdAt,
      lastUsedAt: device.lastUsedAt,
    });

    return new TrustedDevice(
      doc.userId,
      new DeviceFingerprint(doc.deviceId, doc.userAgent, doc.ip),
      doc.createdAt,
      doc.lastUsedAt
    );
  }

  async updateLastUsed(userId: string, deviceId: string): Promise<void> {
    await this.model.updateOne(
      { userId, deviceId },
      { $set: { lastUsedAt: new Date() } }
    );
  }
}
