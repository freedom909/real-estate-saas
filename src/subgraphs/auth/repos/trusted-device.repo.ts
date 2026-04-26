import { inject, injectable } from "tsyringe";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import TrustedDeviceModel, {
  TrustedDevice,
} from "../models/trustedDevice";
import { ITrustedDeviceRepo } from "./ITrustedDeviceRepo";

@injectable()
export default class TrustedDeviceRepository implements ITrustedDeviceRepo {
  constructor(
    @inject(TOKENS_AUTH.models.trustedDevice)
    private model: typeof TrustedDeviceModel
  ) {}

  async find(userId: string, deviceId: string): Promise<TrustedDevice | null> {
    const doc = await this.model.findOne({ userId, deviceId }).lean();
    if (!doc) return null;

    return {
      id: doc.id ?? doc._id.toString(),
      userId: doc.userId,
      deviceId: doc.deviceId,
      createdAt: doc.createdAt,
      lastUsedAt: doc.lastUsedAt,
      deviceName: doc.deviceName,
    };
  }

  async create(data: Partial<TrustedDevice>): Promise<TrustedDevice> {
    const doc = await this.model.create({
      id: data.id,
      userId: data.userId,
      deviceId: data.deviceId,
      lastUsedAt: data.lastUsedAt ?? new Date(),
      deviceName: data.deviceName,
    });

    return {
      id: doc.id ?? doc._id.toString(),
      userId: doc.userId,
      deviceId: doc.deviceId,
      createdAt: doc.createdAt,
      lastUsedAt: doc.lastUsedAt,
      deviceName: doc.deviceName,
    };
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.model.updateOne(
      { $or: [{ id }, { _id: id }] },
      { $set: { lastUsedAt: new Date() } }
    );
  }
}
