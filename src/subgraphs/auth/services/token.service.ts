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
import { hash } from "../../../infrastructure/utils/hash";
import RefreshTokenRepository from "../repos/refresh-token.repo";
import { TOKENS_AUTH } from "../../../modules/tokens/auth.tokens";

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
  PRIVATE_KEY = fs.readFileSync(process.env.PRIVATE_PATH, "utf-8");
  PUBLIC_KEY = fs.readFileSync(process.env.PUBLIC_PATH, "utf-8");

  constructor(
    @inject(TOKENS.security.blacklist) private blacklist: Blacklist,
    @inject(TOKENS_AUTH.repos.refreshTokenRepo) private refreshTokenRepo: RefreshTokenRepository
  ) {}

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
    const privateKey = this.PRIVATE_KEY?.replace(/\\n/g, '\n') || "";
    
    if (!privateKey ) {
      throw new Error("Missing PRIVATE_KEY in env");
    }

    const token = jwt.sign(payload, privateKey, {
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
    const publicKey = this.PUBLIC_KEY?.replace(/\\n/g, '\n') || "";
   if (!publicKey) {
    throw new Error("Missing PUBLIC_KEY in env");
   }
    const payload = jwt.verify(token, publicKey, { algorithms: ["RS256"] }) as TokenPayload;
    console.log("payload",payload)
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

async issueAndPersistTokenPair(params:{
  userId: string;
  sessionId: string;
  familyId: string;
  deviceId?: string;
  rotatedFrom?: string; // 👈 新增
}) {
  const refresh = this.sign(
    {
      sub: params.userId,
      sessionId: params.sessionId,
      familyId: params.familyId,
    },
    "refresh",
    "7d"
  );

  const access = this.sign(
    {
      sub: params.userId,
      sessionId: params.sessionId,
      familyId: params.familyId,
    },
    "access",
    "15m"
  );
console.log("NEW JTI:", refresh.jti);
  await this.refreshTokenRepo.save(refresh.token, {
    jti: refresh.jti,
    userId: params.userId,
    sessionId: params.sessionId,
    familyId: params.familyId,
    tokenHash: hash(refresh.token),
    status: "active",
    issuedAt: new Date(),
    expiresAt: refresh.expiresAt,
    rotatedFrom: params.rotatedFrom || null,
  });

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    refreshJti: refresh.jti,
    refreshExpiresAt: refresh.expiresAt,
  };
}
}
