import geoip, { Location } from "geoip-lite";
import mongoose from "mongoose";
import { createRedis } from "../../../../infrastructure/redis/redis";
import { RiskEventRepo } from "../../repos/risk.event.repo";
import { inject, injectable } from "tsyringe";
import SessionRepository from "../../repos/session.repo";
import Redis from "ioredis/built/Redis";
import { TOKENS_INFRA } from "../../../../modules/infra/container/infra.tokens";
import { TOKENS_AUTH } from "../../../../modules/auth/container/auth.tokens";
import RiskEventEntity from "../../domain/risk.event";

interface EvaluateParams {
  userId: string;
  ip: string;
  deviceId: string;
}

interface EvaluateResult {
  risk: number;
  flags: string[];
  country: string;
}

interface LoginProfile {
  lastIp?: string;
  lastCountry?: string;
  lastLoginAt?: number;
}

interface SuccessRecordParams {
  userId: string;
  ip: string;
  deviceId: string;
  country: string;
}

interface ReuseParams {
  userId: string;
  ip: string;
  userAgent?: string;
  refreshTokenId: string;
}

interface RiskEvent {
  type: string;
  provider?: string;
  
  userId: string;
  ip: string;
  userAgent?: string;
  metadata?: any;
  deviceId?: string;
  severity: string;
  createdAt?: Date;
  familyId?: string;
  sessionId?: string;
}

@injectable()
export default class LoginRiskService {
  constructor(
    @inject(TOKENS_AUTH.repos.riskEventRepo)
    private riskEventRepo: RiskEventRepo,

    @inject(TOKENS_INFRA.infra.redis)
    private redisClient: Redis,

    @inject(TOKENS_AUTH.repos.sessionRepo)
    private sessionRepo: SessionRepository,
  ) {}


  isRisky({ oldIp, newIp, oldUA, newUA }: { oldIp?: string; newIp: string; oldUA?: string; newUA?: string }): boolean {
    if (oldIp && oldIp !== newIp) return true;
    if (oldUA && oldUA !== newUA) return true;
    return false;
  }

  async record(event: Omit<RiskEvent, 'createdAt'>): Promise<void> {
    console.log("record",event,RiskEventEntity)
    await this.riskEventRepo.create({
      userId: event.userId,
      eventData: {
        type: event.type,
        data: event.metadata
      },
      ip: event.ip,
      userAgent: event.userAgent,
      deviceId: event.deviceId
    })
  }

  async handleRefreshTokenReuse(data: any) {
    console.log("🚨 TOKEN REUSE DETECTED", data);

    // 1. revoke session
    await this.sessionRepo.revokeSession(data.sessionId);

    // 2. 记录风险
    await this.riskEventRepo.create({
      userId: data.userId,
  eventData: {
    type: "TOKEN_REUSE",
    data: {
      sessionId: data.sessionId,
      familyId: data.familyId,
      ip: data.ip,
      userAgent: data.userAgent,
    }
  },
  severity: "HIGH",
    });
  }

  async evaluate({
    userId,
    ip,
    deviceId,
  }: EvaluateParams): Promise<EvaluateResult> {
    let risk = 0;
    const flags: string[] = [];

    const geo: Location | null = geoip.lookup(ip);
    const country = geo?.country ?? "UNKNOWN";

    const profileKey = `user:${userId}:loginProfile`;

    const profile: LoginProfile = await this.redisClient.hgetall(profileKey);

    // 1️⃣ IP 变化
    if (profile.lastIp && profile.lastIp !== ip) {
      risk += 20;
      flags.push("NEW_IP");
    }

    // 2️⃣ 国家变化
    if (
      profile.lastCountry &&
      profile.lastCountry !== country
    ) {
      risk += 40;
      flags.push("NEW_COUNTRY");
    }

    // 3️⃣ 新设备
    const isKnownDevice = await this.redisClient.sismember(
      `user:${userId}:knownDevices`,
      deviceId
    );

    if (!isKnownDevice) {
      risk += 30;
      flags.push("NEW_DEVICE");
    }

    // 4️⃣ 时间异常（简单版）
    const hour = new Date().getHours();
    if (
      profile.lastLoginAt &&
      (hour < 6 || hour > 23)
    ) {
      risk += 10;
      flags.push("ODD_HOUR");
    }

    return { risk, flags, country };
  }

  async recordSuccess({
    userId,
    ip,
    deviceId,
    country,
  }: SuccessRecordParams): Promise<void> {
    const pipeline = this.redisClient.pipeline();

    pipeline.hset(`user:${userId}:loginProfile`, {
      lastIp: ip,
      lastCountry: country,
      lastLoginAt: Date.now(),
    });

    pipeline.sadd(
      `user:${userId}:knownDevices`,
      deviceId
    );

    await pipeline.exec();
  }

  async onRefreshTokenReuse(userId: string): Promise<void> {
    const key = `user:${userId}:reuseCount`;

    const count = await this.redisClient.incr(key);
    if (count === 1) {
      await this.redisClient.expire(key, 3600); // 1h
    }

    // 🚨 阈值
    if (count >= 2) {
      await this.freezeUser(userId);
    }
  }

  async freezeUser(userId: string): Promise<void> {
    await this.redisClient.set(
      `user:${userId}:security`,
      JSON.stringify({
        status: "FROZEN",
        reason: "refreshToken_REUSE",
        at: Date.now(),
      })
    );
  }

  async assertUserIsActive(userId: string): Promise<void> {
    const data = await this.redisClient.get(`user:${userId}:security`);
    if (!data) return;

    const security = JSON.parse(data);
    if (security.status === "FROZEN") {
      throw new Error("Account frozen due to security risk");
    }
  }

  async recordLoginFailed(userId: string, ctx: { ip: string; userAgent: string; deviceId: string }) {
    await this.riskEventRepo.create({
      userId,
      eventData: {
        type: "LOGIN_FAILED",
        data: {}
      },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      deviceId: ctx.deviceId
    })
  }
}