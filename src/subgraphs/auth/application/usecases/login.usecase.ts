// application/usecases/oauthLogin.usecase.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import { ProviderRegistry } from "../../infrastructure/oauth/provider.registry";
import { OAuthLoginCommand } from "../dto/oauthLogin.command";
import EvaluateRiskUseCase from "@/security/application/evaluateRisk.usecase";
import { IdentityRepository } from "../../infrastructure/repos/identity.repo";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { IUserGateway } from "../../domain/ports/user.gateway";
import ChallengeRepo from "../../infrastructure/repos/challenge.repo";
import SessionPort, { ISessionPort } from "../../domain/ports/session.port";
import { AuthResult } from "../../domain/entities/authResult";
import { AuthResponseMapper } from "../dto/auth-response.mapper";


@injectable()
export class OAuthLoginUseCase {
  constructor(
    @inject(TOKENS_AUTH.usecases.providerRegistry)
    private registry: ProviderRegistry,

    @inject(TOKENS_AUTH.ports.userGateway)
    private userGateway: IUserGateway,

    @inject(TOKENS_SECURITY.evaluateRiskUseCase)//it belongs to the 'security layer'
    private riskUseCase: EvaluateRiskUseCase,

    @inject(TOKENS_AUTH.repos.challengeRepo)
    private challengeRepo: ChallengeRepo,

    @inject(TOKENS_AUTH.ports.sessionPort)
    private sessionPort: SessionPort,

    @inject(TOKENS_AUTH.repos.identityRepo)
    private identityRepo: IdentityRepository
  ) {}

async execute(cmd: OAuthLoginCommand): Promise<AuthResult>  {

  // 1️⃣ provider verify
  const provider = this.registry.get(cmd.provider.toLowerCase());
  const profile = await provider.verify(cmd.idToken);
  console.log("[login] Provider profile:", JSON.stringify({ provider: profile.provider, providerId: profile.providerId, email: profile.email }));

  // 2️⃣ 查 identity（核心！！！）
  let identity = await this.identityRepo.findByProvider(
    profile.provider,
    profile.providerId
  );
  console.log("[login] Identity found:", !!identity);

  let user;

  // 3️⃣ 已存在 → 登录
  if (identity) {
    console.log("[login] Finding user by ID:", identity.userId);
    user = await this.userGateway.findById(identity.userId);
    console.log("[login] User by ID:", !!user);
  } else {

    // 4️⃣ 尝试 email merge（高级策略）
    if (profile.email) {
      console.log("[login] Finding user by email:", profile.email);
      const existingUser = await this.userGateway.findByEmail(profile.email);
      console.log("[login] User by email:", !!existingUser);

      if (existingUser) {
        user = existingUser;
      }
    }

    // 5️⃣ 不存在 → 创建用户
    if (!user) {
      console.log("[login] Creating user from OAuth...");
      try {
        user = await this.userGateway.createFromOAuth(profile);
        console.log("[login] Created user:", !!user, user?.id);
      } catch (createErr: any) {
        console.error("[login] Create user failed:", createErr.message);
        throw createErr;
      }
    }

    // 6️⃣ 创建 identity（关键）
    if (user) {
      console.log("[login] Creating identity for user:", user.id);
      await this.identityRepo.create({
        userId: user.id,
        provider: profile.provider,
        providerId: profile.providerId,
        email: profile.email ?? null
      });
    }
  }

  if (!user) {
    throw new Error("Login failed: User could not be resolved or created.");
  }

  const { ip = "127.0.0.1", userAgent = "unknown", deviceId = "unknown" } = cmd.request || {};

  // 1️⃣ 执行风控评估
  const riskResult = await this.riskUseCase.execute({
    userId: user.id,
    ip,
    userAgent,
    deviceId,
    failedAttempts: 0,
    isNewDevice: !identity,
    ipRisk: false,
  });

    //  BLOCK
  if (riskResult.decision === "BLOCK") {
    return { status: "BLOCKED" };
  }

    // 5️⃣ CHALLENGE（核心🔥）
  if (riskResult.decision === "CHALLENGE") {
    const challenge = await this.challengeRepo.create({
      userId: user.id,
      deviceId,
      type: "OTP",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
     return {
      status: "CHALLENGE",
      challengeId: challenge.id
    };
  }
 // 2️⃣ 顺利进行：如果是 ALLOW 或者是开发环境，生成 Token

const userDTO =
  AuthResponseMapper.toUserDTO(user);
    const tokens = await this.sessionPort.createSession({
    userId: user.id,
    deviceId,
    ip,
    userAgent,
    email: user.email, // Pass the user's email to be included in the session token
  });
  console.log("dto:",userDTO)



  return {
    
    status: "SUCCESS",
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: userDTO,
  }
}
}