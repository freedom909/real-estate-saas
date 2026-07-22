// infrastructure/services/token-binding.service.ts

import { injectable, inject } from "tsyringe";
import { createHash } from "crypto";
import { TOKENS_INFRA } from "@/modules/tokens/infra.tokens";

interface BindingRecord {
  userId: string;
  fingerprint: string;
  createdAt: Date;
  lastSeenAt: Date;
}

@injectable()
export class TokenBindingService {
  private prefix = "token-binding";

  constructor(
    @inject(TOKENS_INFRA.infra.redis)
    private redis: any
  ) {}

  /**
   * Generate a device fingerprint from IP + User-Agent
   */
  private generateFingerprint(ip: string, userAgent: string): string {
    const raw = `${ip}:${userAgent}`;
    return createHash("sha256").update(raw).digest("hex").slice(0, 16);
  }

  /**
   * Bind a token to a device. Called on first login.
   * Stores the fingerprint in Redis with TTL.
   */
  async bind(
    userId: string,
    ip: string,
    userAgent: string,
    ttlSeconds: number = 7 * 24 * 60 * 60 // 7 days
  ): Promise<void> {
    const fingerprint = this.generateFingerprint(ip, userAgent);
    const key = `${this.prefix}:${userId}:${fingerprint}`;

    const record: BindingRecord = {
      userId,
      fingerprint,
      createdAt: new Date(),
      lastSeenAt: new Date(),
    };

    await this.redis.set(key, JSON.stringify(record), "EX", ttlSeconds);

    // Also maintain a set of all fingerprints for this user
    const setKey = `${this.prefix}:${userId}:fingerprints`;
    await this.redis.sadd(setKey, fingerprint);
    await this.redis.expire(setKey, ttlSeconds);
  }

  /**
   * Validate that the current device matches a bound fingerprint.
   * Returns true if:
   * - No binding exists (first time — allow)
   * - Fingerprint matches a bound device
   */
  async validate(
    userId: string,
    ip: string,
    userAgent: string
  ): Promise<boolean> {
    const fingerprint = this.generateFingerprint(ip, userAgent);
    const setKey = `${this.prefix}:${userId}:fingerprints`;

    // Check if user has any bound devices
    const boundFingerprints = await this.redis.smembers(setKey);

    // No bindings yet — first time login, allow and auto-bind
    if (!boundFingerprints || boundFingerprints.length === 0) {
      await this.bind(userId, ip, userAgent);
      return true;
    }

    // Check if current fingerprint is bound
    if (boundFingerprints.includes(fingerprint)) {
      // Update last seen
      const key = `${this.prefix}:${userId}:${fingerprint}`;
      const existing = await this.redis.get(key);
      if (existing) {
        const record: BindingRecord = JSON.parse(existing);
        record.lastSeenAt = new Date();
        await this.redis.set(key, JSON.stringify(record), "EX", 7 * 24 * 60 * 60);
      }
      return true;
    }

    // Unknown device — could allow with challenge or block
    // For now, log and allow (production should trigger OTP/challenge)
    console.warn(
      `[TokenBinding] Unknown device for user ${userId}: ` +
      `fingerprint=${fingerprint}, ip=${ip}`
    );

    return true; // Change to false in production to enforce binding
  }

  /**
   * Remove a specific device binding
   */
  async unbind(userId: string, ip: string, userAgent: string): Promise<void> {
    const fingerprint = this.generateFingerprint(ip, userAgent);
    const key = `${this.prefix}:${userId}:${fingerprint}`;
    const setKey = `${this.prefix}:${userId}:fingerprints`;

    await this.redis.del(key);
    await this.redis.srem(setKey, fingerprint);
  }

  /**
   * Remove all device bindings for a user (logout all devices)
   */
  async unbindAll(userId: string): Promise<void> {
    const setKey = `${this.prefix}:${userId}:fingerprints`;
    const fingerprints = await this.redis.smembers(setKey);

    if (fingerprints && fingerprints.length > 0) {
      const pipeline = this.redis.pipeline();
      for (const fp of fingerprints) {
        pipeline.del(`${this.prefix}:${userId}:${fp}`);
      }
      pipeline.del(setKey);
      await pipeline.exec();
    }
  }

  /**
   * List all bound devices for a user
   */
  async listDevices(userId: string): Promise<BindingRecord[]> {
    const setKey = `${this.prefix}:${userId}:fingerprints`;
    const fingerprints = await this.redis.smembers(setKey);

    if (!fingerprints || fingerprints.length === 0) return [];

    const devices: BindingRecord[] = [];
    for (const fp of fingerprints) {
      const key = `${this.prefix}:${userId}:${fp}`;
      const data = await this.redis.get(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    }

    return devices;
  }
}
