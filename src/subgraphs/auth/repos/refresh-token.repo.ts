// src/subgraphs/auth/repos/refreshToken.repo.ts

import jwt from "jsonwebtoken";

import { Document, Model } from 'mongoose';
import { RefreshToken } from '../models/refreshToken.model';
import { inject, injectable } from "tsyringe";
import { hash } from "../../../infrastructure/utils/hash";

interface RefreshTokenDocument extends RefreshToken, Document {}

@injectable()
export default class RefreshTokenRepository {
  constructor(
    @inject("RefreshTokenModel")
    private model: Model<RefreshTokenDocument>
  ) {}

  /**
   * 🔒 原子：校验 + 标记 used（防并发）
   */
async consume(jti: string): Promise<boolean> {
console.log("CONSUME JTI:", jti);
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
console.log("SAVE JTI:", meta.jti)
  return this.model.create({
    jti: meta.jti,
    userId: meta.userId,
    sessionId: meta.sessionId,
    familyId: meta.familyId,
    tokenHash: hash(refreshToken), 
    status: "active",
      issuedAt: meta.issuedAt ?? new Date(),
      expiresAt: meta.expiresAt,
      rotatedFrom: meta.rotatedFrom,
  });
}

  async findByJti(jti: string): Promise<RefreshTokenDocument | null> {
    console.log("jti-",jti)
    const refreshToken=await this.model.findOne({jti });
    console.log("refreshToken++",refreshToken)
    return refreshToken
  }
async findFamily(familyId: string) {
  return this.model.find({ familyId }).sort({ issuedAt: 1 });
}

async deleteByJti(jti: string): Promise<void> {
  await this.model.deleteOne({ jti });
}

async markAsUsed(jti: string, usedAt: Date): Promise<void> {
  await this.model.updateOne(
    { jti},
    { $set: { status: "used", usedAt } }
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

 async getLineage(jti: string) {
  const chain = [];

  let current = await this.model.findOne({ jti });

  while (current) {
    chain.push(current);

    if (!current.rotatedFrom) break;

    current = await this.model.findOne({
      jti: current.rotatedFrom,
    });
  }

  return chain;
}
}