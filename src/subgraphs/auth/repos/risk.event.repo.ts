import { injectable, inject } from "tsyringe"
import mongoose, { Model } from "mongoose"
import { RiskEventModel } from "../models/risk.event.model"

import RiskEventEntity from "../domain/risk.event"
import { hash } from "../../../infrastructure/utils/hash"
import SessionRepository from "./session.repo"
import RefreshTokenRepository from "./refresh-token.repo"

@injectable()
export class RiskEventRepo {
  constructor(
    @inject("RiskEventModel")
    private model: Model<RiskEventModel>,
    @inject("SessionRepository")
    private sessionRepo:SessionRepository,
    @inject("RefreshTokenRepo")
    private refreshTokenRepo:RefreshTokenRepository
  ) {}
  async create(data: Partial<RiskEventModel>) {

    const doc = await this.model.create({

      userId: data.userId,

      eventType: data.eventData?.type,

      eventData: data.eventData?.data,

      ip: hash(data.ip as string),

      userAgent: hash(data.userAgent as string),

      deviceId: data.deviceId,

    })
    console.log("doc +++", doc)
    return this.toEntity(doc)

  }

  toEntity(doc: any): RiskEventEntity {

    return {
      id: doc._id.toString(),

      userId: doc.userId.toString(),

      type: doc.eventType, // ← 这里改成 type

      eventData: doc.eventData,

      ip: doc.ip,

      userAgent: doc.userAgent,

      deviceId: doc.deviceId,

      createdAt: doc.createdAt,

      updatedAt: doc.updatedAt,

      Type: "",
    }
  }

  async handleAction({
    severity,
    sessionId,
    userId,
  }: {
    severity: string;
    sessionId?: string;
    userId: string;
  }) {
    if (severity === "HIGH") {
      // 🚨 直接封 session
      if (sessionId) {
        await this.sessionRepo.revokeSession(sessionId);
      }
    }
    if (severity === "MEDIUM") {
      // ⚠️ 可以标记风险（比如需要二次验证）
      console.log("⚠️ Medium risk detected");
    }
    // LOW → 只记录
  }

async findRecentDevices(userId: string): Promise<string[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const sessions = await this.sessionRepo.findRecentSessions({
    userId,
    since,
  });

  if (!sessions?.length) return [];

  return [
    ...new Set(
      sessions
        .map((s) => s.deviceId)
        .filter((id): id is string => Boolean(id))
    ),
  ]  as string[];
}

async getLastLoginIp(userId: string): Promise<string | null> {
  const lastEvent = await this.model
    .findOne({
      userId, // ✅ 直接用 string
      "eventData.type": "LOGIN_SUCCESS",
      ip: { $ne: null }
    })
    .sort({ createdAt: -1 })
    .select("ip")
    .lean();

  return lastEvent?.ip ?? null;
}
  async handleRefreshTokenReuse(data) {
  const { familyId, reusedJti } = data;

  const family = await this.refreshTokenRepo.findFamily(familyId);

  console.log("🚨 FAMILY GRAPH:", family.map(t => ({
    jti: t.jti,
    status: t.status,
    rotatedFrom: t.rotatedFrom
  })));

  // 1️⃣ revoke 全家
  await this.refreshTokenRepo.revokeFamily(familyId);

  // 2️⃣ revoke session
  await this.sessionRepo.revokeSession(data.sessionId);

  // 3️⃣ 记录风险
  await this.model.create({
    eventType: "TOKEN_REUSE",
    userId: data.userId,
    severity: "HIGH",
    eventData: {
      reusedJti,
      familyId,
    },
  });
}     
}