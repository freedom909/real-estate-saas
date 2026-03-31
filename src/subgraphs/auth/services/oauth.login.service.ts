import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import OAuthAdapterRegistry from "../adapters/oauth.adapter.registry";
import UserClient from "../adapters/user.client";
import { TokenService } from "./token.service";


import { OAuthProvider } from "../adapters/normalized.oauth.profile";
import { hash } from "../../../infrastructure/utils/hash";
import { TOKENS_AUTH } from "../../../modules/auth/container/auth.tokens";
import { TOKENS_USER } from "../../../modules/user/container/user.tokens";
import SessionService from "./session.service";

import { RiskEngine } from "@/security/domain/risk.engine";
import { TOKENS_SECURITY } from "@/security/container/tokens";
import { fingerprint } from "@/infrastructure/auth/fingerPrint";
import { EvaluateRiskUseCase } from "@/security/application/evaluateRisk.usecase";
import { TOKENS_AUDIT } from "@/subgraphs/audit/container/audit.tokens";
import { AuditPort } from "../domain/auditPort";
import { RiskResult } from "@/security/types";


@injectable()
export class OAuthLoginService {
  constructor(
    @inject(TOKENS_AUTH.adapters.oauthAdapterRegistry) private registry: OAuthAdapterRegistry,
    @inject(TOKENS_USER.userClient) private userClient: UserClient,
    @inject(TOKENS_AUTH.services.tokenService) private tokenService: TokenService,
    @inject(TOKENS_AUTH.services.sessionService) private sessionService: SessionService,
    @inject(TOKENS_SECURITY.evaluateRiskUseCase) private evaluateRiskUseCase: EvaluateRiskUseCase,
    @inject(TOKENS_AUTH.auditPort) private auditPort: AuditPort
  ) { }
  async oauthLogin(provider: string, idToken: string, req) {
    // 1 OAuth
    const adapter = this.registry.get(provider as OAuthProvider);
    const rawProfile = await adapter.verify(idToken);
    const profile = await adapter.map(rawProfile);

    // 2 user
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

    // 3 device fingerprint（🔥）
    const deviceId = fingerprint({
      userAgent: req.userAgent,
      ip: req.ip,
    });

    console.log("usecase++:", this.evaluateRiskUseCase);
    // 4 risk（🔥 提前）
    const risk: RiskResult = await this.evaluateRiskUseCase.execute({
      userId: user.id,
      ip: req.ip,
      deviceId,
      userAgent: req.userAgent,
      failedAttempts: 0,
      isNewDevice: true,
      ipRisk: false,
    });
    console.log("risk--", risk)
    if (risk.decision === "BLOCK") {
      throw new Error("Blocked");
    }

        if (risk.decision === "CHALLENGE") {
          return {
        status: "MFA_REQUIRED",
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }
    console.log("sessionSerivice", this.sessionService) //no output
    // 5 family
    const familyId = await this.sessionService.getOrCreateFamilyId( //no output
      user.id,
      deviceId
    );

    const session = await this.sessionService.createSession({
      refreshTokenId: hash(uuidv4()),
      userId: user.id,
      deviceId,
      ip: req.ip,
      userAgent: req.userAgent,
      familyId,
    });
    console.log("session", session)
    // 7 token
    const pair = await this.tokenService.issueAndPersistTokenPair({
      userId: user.id,
      sessionId: session.id,
      familyId,
      deviceId: req.deviceId,
    });
    console.log("pair", pair)
    // 8 audit（🔥 异步）

    await this.auditPort.record({
      userId: user.id,
      resourceId: user.id,
      action: "LOGIN",
      metadata: {
        ip: req.ip,
        deviceId,
        provider,
      },
    });


    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      user,
    };
  }
}
export default OAuthLoginService;