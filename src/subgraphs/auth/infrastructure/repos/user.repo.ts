import { Model } from 'mongoose';

import { Redis } from 'ioredis';
import { HydratedDocument } from "mongoose";
import { createRedis } from '@/infrastructure/redis/redis';
import { UserDocument } from '@/subgraphs/user/models/user.model.js';


interface UserRepoOptions {
  UserModel: any;
  redis?: Redis;
}

interface UserCreationData {
  email: string;
  emailVerified?: boolean;
  name?: string;
  avatar?: string;
  provider?: string;
  providerSub?: string;
  fullname?: string;
  picture?: string;
}

interface UserCreationData {
  email: string;
  emailVerified?: boolean;
  name?: string;
  avatar?: string;
  provider?: string;
  providerSub?: string;
  fullname?: string;
  picture?: string;
}

export default class UserRepo {
  private UserModel: any;
  private redis: Redis;

  constructor({ UserModel, redis }: UserRepoOptions) {
    this.UserModel = UserModel;
    this.redis = redis || createRedis();
  }

  /**
  * Get the current token version for a user (from Redis cache)
  */
async getTokenVersion(userId: string): Promise<number> {
  const key = `user:${userId}:tokenVersion`;

  // 1️⃣ Try Redis
  const cached = await this.redis.get(key);

  if (cached !== null) {
    return Number(cached);
  }

  // 2️⃣ DB fallback
  const user = await this.UserModel.findById(userId)
    .select("tokenVersion")
    .lean();

  const version = user?.tokenVersion ?? 0;

  // 3️⃣ Cache
  await this.redis.set(key, String(version), "EX", 60 * 60);

  return version;
}
  /**
   * Increment token version (invalidate all existing refresh tokens)
   */
  async incrementTokenVersion(userId: string): Promise<number> {
    // Increment in DB
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    );

    // Update Redis cache
    const key = `user:${userId}:tokenVersion`;
    await this.redis.set(key, user.tokenVersion, "EX", 60 * 60);

    return user.tokenVersion;
  }

  // UserRepo
  async findOrCreateUserByEmail({ email, fullname, picture }: { email: string; fullname?: string; picture?: string }): Promise<UserDocument> {
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create({ email, fullname, picture });
    }
    return user;
  }

  // ❗ UserRepo — 临时兼容接口
  async findOrCreateOAuthUser(input: { email: string; fullname?: string; picture?: string; provider?: string; providerSub?: string }): Promise<UserDocument> {
    console.warn(
      "[DEPRECATED] findOrCreateOAuthUser is deprecated. Use AuthService.oauthLogin instead."
    );

    const { email, fullname, picture, provider, providerSub } = input;

    // 1️⃣ 找 / 建 user
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create({ email, fullname, picture });
    }

    return user; // ⚠️ 只返回 User
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findById(id);
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email });
  }

  create(data: UserCreationData): Promise<UserDocument> {
    return this.UserModel.create({
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      provider: data.provider,
      providerSub: data.providerSub
    });
  }
}