import { createRedis } from "@/infrastructure/redis/redis";
import { hash } from "@/infrastructure/utils/hash";


interface RefreshTokenData {
  userId: string;
  token: string;
  sessionId: string;
  deviceId: string;
  ttl: number;
  issuedAt: Date;
}

interface RefreshTokenMeta {
  userId: string;
  sessionId: string;
  deviceId: string;
  issuedAt?: string;
}

const redis = createRedis();



export default class RedisRefreshTokenRepo {
  async consume(token: string): Promise<RefreshTokenMeta | null> {
  const h = hash(token);

  const luaScript = `
    local userId = redis.call("HGET", KEYS[1], "userId")
    local sessionId = redis.call("HGET", KEYS[1], "sessionId")
    local deviceId = redis.call("HGET", KEYS[1], "deviceId")
    local issuedAt = redis.call("HGET", KEYS[1], "issuedAt")

    if not userId or not sessionId or not deviceId then
      return nil
    end

    redis.call("DEL", KEYS[1])
    redis.call("SREM", "user:" .. userId .. ":refreshTokens", ARGV[1])
    redis.call("SREM", "user:" .. userId .. ":devices:" .. deviceId, sessionId)

    return { userId, sessionId, deviceId, issuedAt or "" }
  `;

  const result = await redis.eval(
    luaScript,
    1,
    `refresh:${h}`,
    h
  ) as string[] | null;

  if (!result) {
    return null;
  }

  return {
    userId: result[0],
    sessionId: result[1],
    deviceId: result[2],
    issuedAt: result[3] || undefined,
  };
}

  async save({ userId, token, sessionId, deviceId, ttl, issuedAt }: RefreshTokenData): Promise<void> {
    const h = hash(token);

    const pipeline = redis.pipeline();
    pipeline.hset(`refresh:${h}`, {
      userId,
      sessionId,
      deviceId,
      issuedAt: issuedAt?.toISOString(),
    });
    pipeline.expire(`refresh:${h}`, ttl);

    pipeline.sadd(`user:${userId}:refreshTokens`, h);
    pipeline.sadd(
      `user:${userId}:devices:${deviceId}`,
      sessionId
    );

    await pipeline.exec();
  }

  async get(token: string): Promise<Partial<RefreshTokenMeta>> {
    return redis.hgetall(`refresh:${hash(token)}`);
  }

  async delete(token: string): Promise<void> {
    const h = hash(token);
    const meta: Partial<RefreshTokenMeta> = await redis.hgetall(`refresh:${h}`);
    if (!meta.userId) return;

    const pipeline = redis.pipeline();
    pipeline.del(`refresh:${h}`);
    pipeline.srem(`user:${meta.userId}:refreshTokens`, h);
    pipeline.srem(
      `user:${meta.userId}:devices:${meta.deviceId}`,
      meta.sessionId as string
    );

    await pipeline.exec();
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const keys = await redis.keys("refresh:*");

    for (const key of keys) {
      const meta = await redis.hgetall(key);
      if (
        meta.userId === userId &&
        meta.sessionId === sessionId
      ) {
        await redis.del(key);
      }
    }
  }

  async revokeDevice(userId: string, deviceId: string): Promise<void> {
    const sessions = await redis.smembers(
      `user:${userId}:devices:${deviceId}`
    );

    for (const sid of sessions) {
      await this.revokeSession(userId, sid);
    }

    await redis.del(
      `user:${userId}:devices:${deviceId}`
    );
  }

  async revokeAll(userId: string): Promise<void> {
    const hashes = await redis.smembers(
      `user:${userId}:refreshTokens`
    );

    const pipeline = redis.pipeline();
    hashes.forEach((h) =>
      pipeline.del(`refresh:${h}`)
    );
    pipeline.del(`user:${userId}:refreshTokens`);
    await pipeline.exec();
  }
}