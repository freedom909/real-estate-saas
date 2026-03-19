import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import OAuthAdapterRegistry from "../adapters/oauth.adapter.registry";
import UserClient from "../adapters/user.client";
import { TokenService } from "./token.service";
import SessionRepository from "../repos/session.repo";
import RefreshTokenRepository from "../repos/refresh-token.repo";


import RiskService from "./risk/login.risk.service"

import { OAuthProvider } from "../adapters/normalized.oauth.profile";
import mapOAuthProfile from "./mapOAuthProfile";
import { hash } from "../../../infrastructure/utils/hash";
import { TOKENS_AUTH } from "@/modules/auth/container/auth.tokens";
import { TOKENS_USER } from "@/modules/user/container/user.tokens";
import SessionService from "./session.service";
import LoginRiskService from "./risk/login.risk.service";

@injectable()
export class OAuthLoginService {
  constructor(
    @inject(TOKENS_AUTH.adapters.oauthAdapterRegistry) private registry: OAuthAdapterRegistry,
    @inject(TOKENS_USER.userClient) private userClient: UserClient,
    @inject(TOKENS_AUTH.services.tokenService) private tokenService: TokenService,
    @inject(TOKENS_AUTH.services.sessionService) private sessionService: SessionService,
    @inject(TOKENS_AUTH.services.loginRiskService) private loginRiskService: LoginRiskService
  ) {}

  async oauthLogin(
    provider: string,
    idToken: string,
    req
  ) {
    console.log("registry instance:", this.registry);
    // 1. Verify OAuth Token
    const adapter = this.registry.get(provider as OAuthProvider);
    console.log("adapter+", adapter);//no output
    const rawProfile = await adapter.verify(idToken);
    console.log("rawProfile+", rawProfile);
    const profile = await adapter.map(rawProfile);

    // 2. Find or Create User
    let user = await this.userClient.findByEmail(profile.email);
    if (!user) {
      user = await this.userClient.createOAuthUser({
        provider: provider.toUpperCase(),
        email: profile.email,
        profile: {
          name: profile.name,
          avatar: profile.avatar || "", // Fix profile bug
        },
      });
    }

    // 3. Generate Refresh Token JTI first (Bind Session)
    const refreshJti = uuidv4();
    const familyId = uuidv4();

    // 4. Create Session
    const session = await this.sessionService.createSession({
      userId: user.id,
      deviceId: req.deviceId,
      ip: req.ip,
      userAgent: req.userAgent,
      refreshTokenId: refreshJti,
      familyId: familyId,
    });

    // 5. Generate Tokens
    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      sessionId: session.id,
      familyId: familyId,
      deviceId: req.deviceId,
      ip: req.ip,
      userAgent: req.userAgent,
    });

    const refreshToken = this.tokenService.signRefreshToken({
      sub: user.id,
      sessionId: session.id,
      familyId: familyId,
      jti: refreshJti, // Bind the JTI used in session
      deviceId: req.deviceId,
      ip: req.ip,
      userAgent: req.userAgent,
    });

    // 6. Record Risk Event
    await this.loginRiskService.record({
      type: "LOGIN_SUCCESS",
      userId: user.id,
      ip: req.ip, // Raw
      userAgent: req.userAgent, // Raw
      deviceId: req.deviceId,
      severity: "LOW",
      metadata: { provider, method: "oauth" },
    });

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      user,
    };
  }
}
export default OAuthLoginService;