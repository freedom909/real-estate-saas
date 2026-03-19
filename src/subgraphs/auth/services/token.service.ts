// src/subgraphs/auth/services/token.service.ts
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import Blacklist from "../../../security/blacklist/blacklist";
import { injectable, inject } from "tsyringe";
import { JwtPayload } from "jsonwebtoken";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { TOKENS } from "../../../shared/infra/tokens";
import fs from "fs";

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
  familyId: string
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

export interface TokenPayload {
  sub: string;
  jti: string;
  sessionId: string;
  familyId: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  type: "access" | "refresh";
  exp?: number;
  [key: string]: any;
}

interface SignParams {
  sub: string;
  sessionId: string;
  familyId: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  jti?: string;
}

@injectable()
export class TokenService {
  private privateKey: string;
  private publicKey: string;
  PRIVATE_KEY=fs.readFileSync(process.env.PRIVATE_PATH, "utf-8");
  PUBLIC_KEY=fs.readFileSync(process.env.PUBLIC_PATH, "utf-8");

  constructor(
    @inject(TOKENS.security.blacklist) private blacklist: Blacklist
  ) {
    this.privateKey = this.PRIVATE_KEY?.replace(/\\n/g, '\n') || "";
    this.publicKey = this.PUBLIC_KEY?.replace(/\\n/g, '\n') || "";

    if (!this.privateKey || !this.publicKey) {
      throw new Error("Missing PRIVATE_KEY or PUBLIC_KEY in env");
    }
  }

  signAccessToken(params: SignParams) {
    return this.sign(params, "access", "15m");
  }

  signRefreshToken(params: SignParams) {
    return this.sign(params, "refresh", "7d");
  }

  private sign(params: SignParams, type: "access" | "refresh", expiresIn: string | number) {
    const jti = params.jti || uuidv4();
    const payload = {
      sub: params.sub,
      jti,
      type,
      sessionId: params.sessionId,
      familyId: params.familyId,
      deviceId: params.deviceId,
      ip: params.ip,
      userAgent: params.userAgent,
    };

    const token = jwt.sign(payload, this.privateKey, {
      algorithm: "RS256",
      expiresIn: expiresIn as any
    });

    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    return { token, jti, expiresAt };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.verify(token, "access");
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.verify(token, "refresh");
  }

  private async verify(token: string, requiredType: "access" | "refresh"): Promise<TokenPayload> {
    const payload = jwt.verify(token, this.publicKey, { algorithms: ["RS256"] }) as TokenPayload;

    if (payload.type !== requiredType) {
      throw new Error(`Invalid token type: expected ${requiredType}`);
    }

    if (await this.blacklist.isBlacklisted(payload.jti)) {
      throw new Error("Token revoked/blacklisted");
    }

    return payload;
  }

  async revokeToken(jti: string, exp: number): Promise<void> {
    await this.blacklist.blacklist(jti, exp);
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

    const { token: refreshToken, jti, expiresAt: refreshExpiresAt } =
      this.signRefreshToken(basePayload);

    return {
      accessToken: accessToken.token,
      refreshToken,
      refreshJti: jti,
      refreshExpiresAt,
    };
  }
}
