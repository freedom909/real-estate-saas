// src/subgraphs/auth/services/token.service.ts
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import Blacklist from "../../../security/blacklist/blacklist";
import { injectable, inject } from "tsyringe";
import { JwtPayload } from "jsonwebtoken";
import Redis from "ioredis";

import fs from "fs";

export interface TokenPayload extends JwtPayload {
  userId: string;
  tenantId?: string;
  role?: string;
  jti: string;
  type: "access" | "refresh";
  email?: string;
  tokenVersion?: number;
  familyId?: string;
  sessionId?: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
  refreshExpiresAt: Date;
}

export interface SignedAccessToken {
  token: string
  jti: string
  expiresAt: Date
}

export interface SignedRefreshToken {
  token: string
  jti: string
  familyId: string
  expiresAt: Date
  accessToken: string
  refreshToken: string
  refreshJti: string
  refreshExpiresAt: Date

}

@injectable()
export class TokenService {
  constructor(
    private redis: Redis,
    private blacklist: Blacklist,
    private userClient: any,
    private loginRiskService: any,    
    private privateKey: string,   
  ) {
    this.privateKey = fs.readFileSync(process.env.PRIVATE_PATH, "utf-8");
  }
   
 publicKey = fs.readFileSync(process.env.PUBLIC_PATH, "utf-8");
 
// src/subgraphs/auth/services/token.service.ts

  async verifyAccessToken(token: string) {
    
    const payload = jwt.verify(token, fs.readFileSync(process.env.PUBLIC_PATH, "utf-8"), {
       algorithms: ["RS256"],
    }) as TokenPayload;
    console.log("payload+++++", payload);
    if (await this.blacklist.isBlacklisted(payload.jti)) {
      throw new Error("Token is blacklisted");
    }  
    return payload;
  }

  async verifyRefreshToken(token: string) {
    const payload = jwt.verify(
       token, 
       this.publicKey,
    {
      algorithms: ["RS256"]
    }) as TokenPayload;
    return payload;
  }

  async revokeAccessToken(jti: string, exp: number) {
    await this.blacklist.blacklist(jti, exp);
  }
  async revokeRefreshToken(jti: string, exp: number) {
    await this.blacklist.blacklist(jti, exp);
  }

  async isTokenBlacklisted(jti: string) {
    return await this.blacklist.isBlacklisted(jti);
  }

  /* =========================================================
     ACCESS TOKEN
  ========================================================= */

  signAccessToken(payload: {
    sub: string
    sessionId: string
  }): SignedAccessToken {

    const jti = randomUUID()

    const token = jwt.sign(
      {
        ...payload,
        jti,
      },
      this.privateKey,
      {
        algorithm: "RS256",
        expiresIn: "15m",
      }
    )
 console.log("payload++++", payload)

    return {
      token,
      jti,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }
  }

  issueTokenPair(params: {
    userId: string;
    role?: string;
    email?: string;
    familyId: string;
    sessionId: string;
    deviceId?: string;
    ip?: string;
    userAgent?: string;
  }): TokenPair {
    const {
      userId,
      role,
      email,
      familyId,
      sessionId,
      deviceId,
      ip,
      userAgent,
    } = params;

    // 修复：显式映射 userId 到 sub，以满足 signAccessToken 的类型要求
    const basePayload = {
      sub: userId, 
      userId,
      role,
      email,
      familyId,
      sessionId,
      deviceId,
      ip,
      userAgent,
    };

    const accessToken = this.signAccessToken(basePayload);

    const { token: refreshToken, jti, expiresAt } =
      this.signRefreshToken(basePayload);

    return {
      accessToken: accessToken.token,
      refreshToken,
      refreshJti: jti,
      refreshExpiresAt: expiresAt,
    };
  }

  /* =========================================================
     REFRESH TOKEN
  ========================================================= */

  signRefreshToken(payload: {
    sub: string
    sessionId: string
    familyId?: string
  }): SignedRefreshToken {

    const jti = randomUUID()

    const familyId =
      payload.familyId ?? randomUUID()

    const token = jwt.sign(
      {
        ...payload,
        jti,
        familyId,
      },
      this.privateKey,
      {
        algorithm: "RS256",
        expiresIn: "7d",
      }
    )

    // signRefreshToken は SignedRefreshToken を返す必要があるが、
    // 実装上は TokenPair を返すように呼び出し側で使われているため、
    // ここでは一旦 TokenPair 相当を返して呼び出し側の整合を取る
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return {
      token,
      jti,
      familyId,
      expiresAt: refreshExpiresAt,
      accessToken: "",
      refreshToken: token,
      refreshJti: jti,
      refreshExpiresAt: refreshExpiresAt,
    }
  }

  async logout(userId: string) {
    await this.redis.srem(`user:${userId}:refreshTokens`, "*");
    await this.redis.del(`user:${userId}:devices:*`);
  }

  // async bindOAuthAccount(
  //   userId: string,
  //   provider: string,
  //   idToken: string,
  //   ctx: { ip: string; deviceId: string ,userAgent: string}
  // ) {
  //   const verify=await this.userClient.verifyIdToken(idToken);
  //   const profile = mapOAuthProfile(verify);//logic has the problem, wait
  //   const existing=await this.userClient.findByProviderId(profile.sub, provider);
  //   if (existing) {
  //     throw new Error("Account already bound");
  //   }
  //     const user = await this.userClient.createOAuthUser({
  //       userId,
  //       provider,
  //       email: profile.email,
  //     });
  //     await this.userClient.updateLastLogin(user.id);
  //     await this.loginRiskService.record({
  //       type: "LOGIN_OAUTH",
  //       userId: user.id,
  //       provider,
  //       ip: hash(ctx.ip),
  //       userAgent
  //       : hash(ctx.userAgent),
  //       deviceId: ctx.deviceId,
  //       severity: "LOW",
  //     });
  //     return user;
  // }
}
