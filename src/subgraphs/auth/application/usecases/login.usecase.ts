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
import { ISessionPort } from "../../domain/ports/session.port";


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
    private sessionPort: ISessionPort,

    @inject(TOKENS_AUTH.repos.identityRepo)
    private identityRepo: IdentityRepository
  ) {}

async execute(cmd: OAuthLoginCommand) {

  // 1️⃣ provider verify
  const provider = this.registry.get(cmd.provider.toLowerCase());
  const profile = await provider.verify(cmd.idToken);

  // 2️⃣ 查 identity（核心！！！）
  let identity = await this.identityRepo.findByProvider(
    profile.provider,
    profile.providerId
  );

  let user;

  // 3️⃣ 已存在 → 登录
  if (identity) {

    user = await this.userGateway.findById(identity.userId);// it should not have the uerRepo, how to instead of it?
  } else {

    // 4️⃣ 尝试 email merge（高级策略）
    if (profile.email) {
      const existingUser = await this.userGateway.findByEmail(profile.email);

      if (existingUser) {
        user = existingUser;
      }
    }

    // 5️⃣ 不存在 → 创建用户
    if (!user) {
      user = await this.userGateway.createFromOAuth(profile);
    }

    // 6️⃣ 创建 identity（关键）
    await this.identityRepo.create({
      userId: user.id,
      provider: profile.provider,
      providerId: profile.providerId,
      email: profile.email ?? null
    });
  }

  if (!user) {
    throw new Error("Login failed: User could not be resolved or created.");
  }

  // 1️⃣ 执行风控评估
  const riskResult = await this.riskUseCase.execute({
    userId: user.id,
    ip: (cmd as any).ip || "127.0.0.1",
    userAgent: (cmd as any).userAgent || "unknown",
    deviceId: (cmd as any).deviceId || "unknown",
    failedAttempts: 0,
    isNewDevice: !identity,
    ipRisk: false,
  });

  // 2️⃣ 顺利进行：如果是 ALLOW 或者是开发环境，生成 Token
  const session = await this.sessionPort.createSession(user.id);

  return {
    userId: user.id,
    accessToken: (session as any).accessToken,
    refreshToken: (session as any).refreshToken,
  };
}
}