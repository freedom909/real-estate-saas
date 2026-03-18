// src/subgraphs/auth/repos/refreshToken.repo.ts

import jwt from "jsonwebtoken";

import { Document, Model } from 'mongoose';
import { RefreshToken } from '../models/refreshToken.model';
import { injectable } from "tsyringe";
import { hash } from "../../../infrastructure/utils/hash";

interface RefreshTokenDocument extends RefreshToken, Document {}

@injectable()
export default class RefreshTokenRepository {
  private model: Model<RefreshToken>;

  constructor({ RefreshTokenModel }: { RefreshTokenModel: Model<RefreshToken> }) {
    if (!RefreshTokenModel) {
      throw new Error("RefreshTokenModel not injected");
    }
    this.model = RefreshTokenModel;
  }

  /**
   * 🔒 原子：校验 + 标记 used（防并发）
   */
async consume(jti: string): Promise<boolean> {

  const result = await this.model.updateOne(
    {
      jti,
      status: "active"
    },
    {
      $set: {
        status: "used",
        usedAt: new Date()
      }
    }
  )

  return result.modifiedCount === 1
}

  async revokeBySession(sessionId: string) {
    return this.model.updateMany(
      { sessionId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  /**
   * 💾 保存新 refresh token（只存 hash）
   */
  
async save(
  refreshToken: string,
  meta: RefreshToken & { jti: string; expiresAt: Date }
) {

  return this.model.create({
    userId: meta.userId,
    jti: meta.jti,
    tokenHash: hash(refreshToken), 
    status: "active",
    familyId: meta.familyId,
      sessionId: meta.sessionId,
      issuedAt: meta.issuedAt ?? new Date(),
      expiresAt: meta.expiresAt,
      rotatedFrom: meta.rotatedFrom,
  });
}

  async findByJti(jti: string): Promise<RefreshTokenDocument | null> {
    return this.model.findOne({ tokenId: jti });
  }

async deleteByJti(jti: string): Promise<void> {
  await this.model.deleteOne({ tokenId: jti });
}

async markAsUsed(jti: string, usedAt: Date): Promise<void> {
  await this.model.updateOne(
    { tokenId: jti,usedAt: Date.now()},
    { $set: { status: "used", rotatedAt: new Date() } }
  );
}
  /**
   * 🚨 revoke 某个 token family（并发 / 攻击）
   */
  async revokeFamily(familyId: string) {
    await this.model.updateMany(
      {
        familyId,
        status: "active",
      },
      {
        $set: {
          status: "revoked",
          revokedAt: new Date(),
        },
      }
    );
  }

  /**
   * 🚪 单设备登出
   */
  async revokeByDevice(userId: string, deviceId: string) {
    await this.model.updateMany(
      {
        userId,
        deviceId,
        status: "active",
      },
      {
        $set: {
          status: "revoked",
          revokedAt: new Date(),
        },
      }
    );
  }

  /**
   * 🧨 全用户登出（配合 tokenVersion）
   */
  async revokeAllByUser(userId: string) {
    await this.model.updateMany(
      {
        userId,
        status: "active",
      },
      {
        $set: {
          status: "revoked",
          revokedAt: new Date(),
        },
      }
    );
  }
}