// src/infrastructure/redis/redis.ts
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

let redis: Redis | null = null;

export function createRedis(): Redis {
  if (redis) return redis;
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is not defined");

  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("error", (err: Error) => console.error("❌ Redis error", err));

  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
