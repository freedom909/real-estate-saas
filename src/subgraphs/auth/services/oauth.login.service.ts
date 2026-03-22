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
    @inject(TOKENS_AUTH.services.loginRiskService) private loginRiskService: LoginRiskService,
    
  ) {}
async oauthLogin(provider: string, idToken: string, req) {
  // 1. OAuth
  const adapter = this.registry.get(provider as OAuthProvider);
  const rawProfile = await adapter.verify(idToken);
  const profile = await adapter.map(rawProfile);

  // 2. user
  let user = await this.userClient.findByEmail(profile.email);

  if (!user) {
    user = await this.userClient.createOAuthUser({
      provider: provider.toUpperCase(),
      email: profile.email,
      profile: {
        name: profile.name,
        avatar: profile.avatar || "",
      },
    });
  }

  // 3. familyId（只保留这个）
  const familyId = uuidv4();

  // 4. session
  const session = await this.sessionService.createSession({
    refreshTokenId: hash(uuidv4()),
    userId: user.id,
    deviceId: req.deviceId,
    ip: req.ip,
    userAgent: req.userAgent,
    familyId,
  });
console.log("session",session)

  // 5. ✅ 唯一 token 生成入口
  const pair = await this.tokenService.issueAndPersistTokenPair({
    userId: user.id,
    sessionId: session.id,
    familyId,
    deviceId: req.deviceId,
  });

  // 6. risk
  await this.loginRiskService.record({
    type: "LOGIN_SUCCESS",
    userId: user.id,
    ip: req.ip,
    userAgent: req.userAgent,
    deviceId: req.deviceId,
    severity: "LOW",
    metadata: { provider, method: "oauth" },
  });

  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    user,
  };
}
}
export default OAuthLoginService;