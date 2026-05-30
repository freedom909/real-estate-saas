// application/usecases/oauthLogin.usecase.ts

import { inject, injectable } from "tsyringe";


import { ProviderRegistry } from "../../infrastructure/oauth/provider.registry";
import { OAuthLoginCommand } from "../dto/oauthLogin.command";
import EvaluateRiskUseCase from "@/security/application/evaluateRisk.usecase";
import { IdentityRepository } from "../../infrastructure/repos/identity.repo";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { IUserGateway } from "../../domain/ports/user.gateway";
import ChallengeRepo from "../../infrastructure/repos/challenge.repo";
import SessionPort, { ISessionPort } from "../../domain/ports/session.port";
import { AuthResult } from "../../domain/entities/authResult";

import { AuditLogService } from "@/modules/audit/application/write/services/audit-log.service";
import normalizeAuthError from "../utils/auth-error.util";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";


@injectable()
export class OAuthLoginUseCase {
  constructor(

    @inject(TOKENS_AUTH.usecases.providerRegistry)
    private registry: ProviderRegistry,

    @inject(TOKENS_AUTH.ports.userGateway)
    private userGateway: IUserGateway,

    @inject(TOKENS_SECURITY.evaluateRiskUseCase)
    private riskUseCase: EvaluateRiskUseCase,

    @inject(TOKENS_AUTH.repos.challengeRepo)
    private challengeRepo: ChallengeRepo,

    @inject(TOKENS_AUTH.ports.sessionPort)
    private sessionPort: SessionPort,

    @inject(TOKENS_AUTH.repos.identityRepo)
    private identityRepo: IdentityRepository,

    @inject(TOKENS_AUDIT.services.auditLog)
    private auditLogService:
      AuditLogService
  ) { }

  async execute(
    cmd: OAuthLoginCommand
  ): Promise<AuthResult> {

    const {
      ip = "127.0.0.1",
      userAgent = "unknown",
      deviceId = "unknown",
    } = cmd.request || {};

    try {

      // ==========================
      // provider verify
      // ==========================
      const provider =
        this.registry.get(
          cmd.provider.toLowerCase()
        );

      const profile =
        await provider.verify(
          cmd.idToken
        );

      // ==========================
      // identity
      // ==========================
      let identity =
        await this.identityRepo
          .findByProvider(
            profile.provider,
            profile.providerId
          );

      let user;

      if (identity) {

        user =
          await this.userGateway
            .findById(
              identity.userId
            );

      } else {

        if (profile.email) {

          const existingUser =
            await this.userGateway
              .findByEmail(
                profile.email
              );

          if (existingUser) {
            user = existingUser;
          }
        }

        if (!user) {

          user =
            await this.userGateway
              .createFromOAuth(
                profile
              );
        }

        await this.identityRepo
          .create({
            userId:
              user.id,

            provider:
              profile.provider,

            providerId:
              profile.providerId,

            email:
              profile.email ?? null,
          });
      }

      if (!user) {
        throw new Error(
          "Login failed"
        );
      }

      // ==========================
      // risk
      // ==========================
      const riskResult =
        await this.riskUseCase
          .execute({
            userId: user.id,
            ip,
            userAgent,
            deviceId,
            failedAttempts: 0,
            isNewDevice:
              !identity,
            ipRisk: false,
          });

      if (
        riskResult.decision ===
        "BLOCK"
      ) {

        await this.auditLogService
          .writeAuditLog({
            action:
              "USER_LOGIN_BLOCKED",

            userId:
              user.id,

            resourceId:
              user.id,

            resourceType:
              "AUTH",

            status:
              "FAILED",

            meta: {
              ip,
              deviceId,
              userAgent,
              provider:
                cmd.provider,
            },
          });

        return {
          status:
            "BLOCKED",
        };
      }

      if (
        riskResult.decision ===
        "CHALLENGE"
      ) {

        const challenge =
          await this.challengeRepo
            .create({
              userId:
                user.id,

              deviceId,

              type:
                "OTP",

              status:
                "PENDING",

              expiresAt:
                new Date(
                  Date.now() +
                  5 * 60 * 1000
                ),
            });

        return {
          status:
            "CHALLENGE",

          challengeId:
            challenge.id,
        };
      }

      // ==========================
      // success
      // ==========================
      const tokens =
        await this.sessionPort
          .createSession({
            userId:
              user.id,

            deviceId,
            ip,
            userAgent,
          });

      return {
        status:
          "SUCCESS",

        accessToken:
          tokens.accessToken,

        refreshToken:
          tokens.refreshToken,
      };

    } catch (error) {

      await this.auditLogService
        .writeAuditLog({

          action:
            "USER_LOGIN_FAILED",

          resourceId:
            "unknown",

          resourceType:
            "AUTH",

          status:
            "FAILED",

          meta: {
            ip,
            deviceId,
            userAgent,
            reason:normalizeAuthError(error),
            provider:
              cmd.provider,
          },
        });

      throw error;
    }
  }
}