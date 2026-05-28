

import { container, DependencyContainer } from "tsyringe";

import { ForbiddenError } from "../../infrastructure/utils/errors";
import { TOKENS_AUTH } from "../../modules/tokens/auth.tokens";

import { GeminiSecurityService } from "@/security/infrastructure/geminiSecurity.service";
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import { SecurityAssessment } from "@/domain/user/types/types";
import withSecurity from "@/security/infrastructure/withSecurity";
import { VerifyOtpUseCase } from "./application/usecases/verifyOtp.usecase";
import { subgraphAuthGuard } from "./guards/subgraphAuthGuard";


import Blacklist from "@/security/blacklist/blacklist";
import { IdentityRepository } from "./infrastructure/repos/identity.repo";
import { OAuthLoginUseCase } from "./application/usecases/login.usecase";

interface User {
  userId: string;
  [key: string]: any;
}

interface Context {
  user?: {
    userId: string;
  };

  req: any;
  res: any;
  container: DependencyContainer;
}

interface AuthPayload {
  userId: string;
  [key: string]: any;
}

const requireScope = (scopes: string[]) => (ctx: Context, fn: () => any) => {
  // スコープチェックのロジックをここに実装
  // 便宜上、常にfnを実行するようにしています
  return fn();
};

const sessionRepo = {
  listByUser: (userId: string) => Promise.resolve([]),
  revoke: (sessionId: string) => Promise.resolve()
};

const refreshTokenRepository = {
  revokeBySession: (sessionId: string) => Promise.resolve()
};

const listOnlineSessions = (redis: any) => {
  // オンラインセッションをリストするロジック
  return [];
};

export const withAuth =
  (resolver: any, guard: any) =>
    async (parent: any, args: any, context: any, info: any) => {
      await guard(parent, args, context, async () => { })
      return resolver(parent, args, context, info)
    }

export default {
  Query: {
    me: withAuth(
      async (_: unknown, __: unknown, { user }: Context) => {
        if (!user) return null;

        return {
          __typename: "User",
          id: user.userId,
        };
      },
      subgraphAuthGuard
    ),

    // listOAuthAccounts: async (_: unknown, __: unknown, ctx: Context) => {
    //   if (!ctx.user) throw new Error("Unauthorized");

    //   const authService = ctx.container.resolve<AuthService>(
    //     TOKENS_AUTH.services.authService
    //   );

    //   return authService.listOAuthAccounts(ctx.user.userId);
    // },

    // mySessions: withAuth(
    //   async (_: unknown, __: unknown, ctx: Context) => {
    //     const authService = ctx.container.resolve(
    //       TOKENS_AUTH.services.authService
    //     );

    //     return authService.getMySessions(ctx.user!.userId);
    //   },
    //   subgraphAuthGuard
    // ),

    // mySecurityEvents: async (
    //   _: unknown,
    //   { limit }: { limit: number },
    //   ctx: Context
    // ) => {
    //   if (!ctx.user) throw new Error("Unauthorized");

    //   const repo = ctx.container.resolve(
    //     TOKENS_SECURITY.repos.securityEventRepository
    //   );

    //   return repo.findByUser(ctx.user.userId, limit);
    // },

    _authHealth: () => true,
  },

  Mutation: {
    oauthLogin: async (
      _: unknown,
      { provider, idToken }: { provider: string; idToken: string },
      ctx: Context
    ) => {
      const usecase = ctx.container.resolve<OAuthLoginUseCase>(
        TOKENS_AUTH.usecases.oauthLoginUseCase
      );

      return usecase.execute({
        provider,
        idToken,
        request: {
          ip: ctx.req.ip || (ctx.req.headers["x-forwarded-for"] as string) || "127.0.0.1",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
          deviceId: (ctx.req.headers["x-device-id"] as string) || "unknown",
        },
      });
    },

    // refreshToken: async (
    //   _: unknown,
    //   { refreshToken }: { refreshToken: string },
    //   ctx: Context
    // ) => {
    //   const service = ctx.container.resolve(
    //     TOKENS_AUTH.services.refreshTokenService
    //   );

    //   return (service as RefreshTokenService).refresh(refreshToken, ctx.userClient);
    // },

    // logout: async (_: unknown, __: unknown, ctx: Context) => {
    //   if (!ctx.user) throw new Error("Unauthorized");

    //   const service = ctx.container.resolve(
    //     TOKENS_AUTH.services.refreshTokenService
    //   );

    //   await service.revokeAll(ctx.user.userId);
    //   return true;
    // },

    // revokeSession: async (
    //   _: unknown,
    //   { sessionId }: { sessionId: string },
    //   ctx: Context
    // ) => {
    //   if (!ctx.user) throw new Error("Unauthorized");

    //   const authHeader = ctx.request.headers?.authorization;

    //   const token =
    //     typeof authHeader === "string"
    //       ? authHeader.replace("Bearer ", "")
    //       : undefined;

    //   if (!token) throw new Error("Authentication required");

    //   const authService = ctx.container.resolve<AuthService>(
    //     TOKENS_AUTH.services.authService
    //   );

    //   return authService.revokeSession(
    //     ctx.user.userId,
    //     sessionId,
    //     token
    //   );
    // },

myIdentities: async (_: any, __: any, ctx: Context) => {
  return ctx.container
    .resolve(IdentityRepository)
    .findByUser(ctx.user.userId);
},

    verifyOtp: async (
      _: unknown,
      { challengeId, code }: { challengeId: string; code: string }, // ✅ 修正
      ctx: Context
    ) => {
      const usecase = ctx.container.resolve<VerifyOtpUseCase>(
        TOKENS_AUTH.usecases.verifyOtpUseCase
      );

      return usecase.execute({
        challengeId,
        otpCode: code, // ✅ 内部统一
        request: {
          ip: ctx.req.ip || (ctx.req.headers["x-forwarded-for"] as string) || "127.0.0.1",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
          deviceId: (ctx.req.headers["x-device-id"] as string) || "unknown",
        },
      });
    },

    // bindOAuthAccount: async (
    //   _: unknown,
    //   { provider, idToken }: { provider: OAuthProvider; idToken: string },
    //   ctx: Context
    // ) => {
    //   if (!ctx.user) throw new Error("Unauthorized");

    //   const authService = ctx.container.resolve<AuthService>(
    //     TOKENS_AUTH.services.authService
    //   );

    //   return authService.bindOAuthAccount(
    //     ctx.user.userId,
    //     provider,
    //     idToken
    //   );
    // },

    // unbindOAuthAccount: async (
    //   _: unknown,
    //   { provider }: { provider: OAuthProvider },
    //   ctx: Context
    // ) => {
    //   if (!ctx.user) throw new Error("Unauthorized");

    //   const authService = ctx.container.resolve<AuthService>(
    //     TOKENS_AUTH.services.authService
    //   );

    //   return authService.unbindOAuthAccount(
    //     ctx.user.userId,
    //     provider,
    //     {
    //       ip: ctx.request.ip,
    //       deviceId: ctx.request.deviceId ?? null,
    //     }
    //   );
    // },

    // bindOAuth: async (
    //   _: unknown,
    //   { provider, idToken }: { provider: OAuthProvider; idToken: string },
    //   ctx: Context
    // ) => {
    //   if (!ctx.user) throw new Error("Unauthorized");

    //   const authService = ctx.container.resolve<AuthService>(
    //     TOKENS_AUTH.services.authService
    //   );

    //   return authService.bindOAuthAccount(
    //     ctx.user.userId,
    //     provider,
    //     idToken
    //   );
    // },

  //   unbindOAuth: async (
  //     _: unknown,
  //     { provider }: { provider: OAuthProvider },
  //     ctx: Context
  //   ) => {
  //     if (!ctx.user) throw new Error("Unauthorized");

  //     const authService = ctx.container.resolve<AuthService>(
  //       TOKENS_AUTH.services.authService
  //     );

  //     return authService.unbindOAuthAccount(
  //       ctx.user.userId,
  //       provider,
  //       {
  //         ip: ctx.request.ip,
  //         deviceId: ctx.request.deviceId ?? null,
  //       }
  //     );
  //   },
 },
  
  AuthPayload: {
    user: (parent: AuthPayload) => ({
      __typename: "User",
      id: parent.userId,
    }),
  },
}