//redis/service.ts

// redis.service.ts
import { injectable } from "tsyringe";
import { createRedis } from "./redis";

@injectable()
export class RedisService {
redis=createRedis()
  async get(key: string) {
    return await this.redis.get(key);
  }

  async set(key: string, value: string) {
    return await this.redis.set(key, value);
  }

  async del(key: string) {
    return await this.redis.del(key);
  }
}

export default RedisService;