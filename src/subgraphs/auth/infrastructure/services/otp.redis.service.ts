//src/subgraphs/auth/infrastructure/services/otp.redis.service.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_INFRA } from "@/infrastructure/infra.tokens";
import Redis from "ioredis";
import { RedisKeys } from "../cache/redisKey.factory";

@injectable()
//src/subgraphs/auth/infrastructure/services/otp.redis.service.ts
export class OtpRedisService implements OtpService {
    async invalidate(challengeId: string): Promise<void> {
        await this.redis.del(`otp:${challengeId}`);
        await this.redis.del(`otp:attempts:${challengeId}`);
    }
    constructor(
        @inject(TOKENS_INFRA.infra.redis)
        private redis: Redis
    ) { }

    async generate(userId: string): Promise<string> {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const key = `otp:${userId}`;

        await this.redis.set(key, code);

        return code;
    }

async verify(challengeId: string, code: string) {
  const attemptsKey = `otp:attempts:${challengeId}`;
  const attempts = await this.redis.incr(attemptsKey);

  if (attempts > 5) {
    throw new Error("Too many attempts");
  }

  const stored = await this.redis.get(`otp:${challengeId}`);
  return stored === code;
}
}
