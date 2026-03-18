// src/subgraphs/authz/blacklist/blacklist.ts
import { injectable, inject } from "tsyringe";
import { Redis } from "ioredis";

@injectable()
export default class Blacklist {
  constructor( 
    private readonly redis: Redis) {}

  async blacklist(jti: string, exp: number) {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return;
    await this.redis.set(`bl:${jti}`, "1", "EX", ttl);
  }

  async isBlacklisted(jti: string) {
    const exists = await this.redis.get(`bl:${jti}`);
    return !!exists;
  }

  async addToBlacklist(jti: string, exp: number) {
    await this.blacklist(jti, exp);
  }

  async removeFromBlacklist(jti: string) {
    await this.redis.del(`bl:${jti}`);
  }
}