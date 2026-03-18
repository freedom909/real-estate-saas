// src/modules/auth/service/oauthLogin.service.ts

import mongoose from "mongoose";

import OAuthAdapterRegistry from "../adapters/oauth.adapter.registry";
import UserClient from "../adapters/user.client";
import { TokenService } from "./token.service";
import SessionRepository from "../repos/session.repo";
import RefreshTokenRepository from "../repos/refresh-token.repo";


import RiskService from "./risk/login.risk.service"
import { inject, injectable } from "tsyringe";
import { OAuthProvider } from "../adapters/normalized.oauth.profile";
import mapOAuthProfile from "./mapOAuthProfile";
import { hash } from "../../../infrastructure/utils/hash";

interface OAuthLoginServiceDeps {
  
  adapterRegistry: OAuthAdapterRegistry;
  userClient: UserClient;
  sessionRepo: SessionRepository;
  refreshTokenRepository: RefreshTokenRepository;
  tokenService: TokenService;
  loginRiskService: RiskService;
}

@injectable()
export class OAuthLoginService {
  constructor(
    private userClient: UserClient,
    private tokenService: TokenService,
    private refreshTokenRepository: RefreshTokenRepository,   
    private loginRiskService: RiskService,
    private sessionRepo: SessionRepository,
    private oauthAdapterRegistry: OAuthAdapterRegistry,
  ) { }

  async oauthLogin(provider: string, idToken: string, req: any) {
    console.log("registry instance:", this.oauthAdapterRegistry);
    // 1 verify OAuth token
       // ⭐ 分流发生在这里
    const adapter = this.oauthAdapterRegistry.get(provider as OAuthProvider);
    
    const rawProfile = await adapter.verify(idToken as string);
    
    // 2 normalize profile
    // const adapter = this.oauthAdapterRegistry.get(provider as OAuthProvider);
   console.log('adapter++', adapter)
    const profile = await adapter.map(rawProfile);

    console.log("profile++++", profile)
    // 3 find user by OAuth credential
    let user =await this.userClient.findByEmail(profile.email as string);
    console.log("user++++", user)
    // 4 create OAuth user if not exist
if (!user) {
user = await this.userClient.createOAuthUser({
  provider: profile.provider.toUpperCase(),
  email: profile.email as string,
  profile: {
    name: profile.name,
    avatar: profile.avatar?? null
  }
});
if (!user) {
  throw new Error("OAuth login failed");
}
}
    console.log("user++++", user)
    try {
      // 5 create session
      const refreshTokenId = new mongoose.Types.ObjectId().toHexString();
      console.log("refreshTokenId++", refreshTokenId)
      
      const deviceId = req.headers["x-device-id"] as string;

      const session = await this.sessionRepo.create({
        userId: user.id,
        deviceId: deviceId,

        familyId: new mongoose.Types.ObjectId().toHexString(),

        refreshTokenId,

        ipHash: hash(req.ip ?? ""),

        userAgentHash: hash(req.headers["user-agent"] ?? ""),

        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

      })
      console.log("session++", session)
      // 6 issue access token
      const { token: accessToken } =
        this.tokenService.signAccessToken({
          sub: user.id,
          sessionId: session.id

        });

      // 7 issue refresh token
      const {
        token: refreshToken,
        jti: refreshJti,
        familyId
      } =
        this.tokenService.signRefreshToken({
          sub: user.id,
          sessionId: session.id,
          familyId: session.familyId
        });


      // 8 store refresh token metadata
      await this.refreshTokenRepository.save(refreshToken, {

        userId: user.id,

        sessionId: session.id,

        jti: refreshJti,

        familyId,

        issuedAt: new Date(),

        expiresAt:
          new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),

        rotatedFrom: null,

        status: "active",

        tokenHash: hash(refreshToken)
      });

      // 9 update last login
      await this.userClient.updateLastLogin(user.id);

      // 10 record login risk event
      await this.loginRiskService.record({

        type: "LOGIN_OAUTH",

        userId: user.id,

        sessionId: session.id,

        provider,

        ip: hash(req.ip ?? ""),
        userAgent: hash(req.headers["user-agent"] ?? ""),

        deviceId: deviceId,

        severity: "LOW"

      });

      // 11 return tokens
      return {

        accessToken,

        refreshToken,

        user

      };

    } catch (err) {

      console.error("SESSION CREATE ERROR:", err)

      throw new Error("OAuth login failed")

    }

  }
}