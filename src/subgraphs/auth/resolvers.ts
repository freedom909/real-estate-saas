// src/subgraphs/auth/resolvers/index.ts

import { container, DependencyContainer } from "tsyringe";
import jwt from "jsonwebtoken";

import { ForbiddenError } from "../../infrastructure/utils/errors";
import { TOKENS_AUTH } from "../../modules/tokens/auth.tokens";

import { VerifyOtpUseCase } from "./application/usecases/verifyOtp.usecase";
import { subgraphAuthGuard } from "./guards/subgraphAuthGuard";

import { IdentityRepository } from "./infrastructure/repos/identity.repo";
import { OAuthLoginUseCase } from "./application/usecases/login.usecase";
import { ISessionPort } from "./domain/ports/session.port";
import { IUserGateway } from "./domain/ports/user.gateway";
import { requireGlobalRole } from "./application/requireGlobalRole";

type User = {
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
  // ã‚¹ã‚³ãƒ¼ãƒ—ãƒã‚§ãƒƒã‚¯ã®ãƒ­ã‚¸ãƒƒã‚¯ã‚’ã“ã“ã«å®Ÿè£…
  // ä¾¿å®œä¸Šã€å¸¸ã«fnã‚’å®Ÿè¡Œã™ã‚‹ã‚ˆã†ã«ã—ã¦ã„ã¾ã™
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
  // ã‚ªãƒ³ãƒ©ã‚¤ãƒ³ã‚»ãƒƒã‚·ãƒ§ãƒ³ã‚’ãƒªã‚¹ãƒˆã™ã‚‹ãƒ­ã‚¸ãƒƒã‚¯
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
  _,
  {
    provider,
    credential,
  }: {
    provider: string;
    credential: {
      code?: string;
      accessToken?: string;
      idToken?: string;
    };
  },
  ctx: Context
) => {

  console.log(
    "========== AUTH OAUTH LOGIN CALLED =========="
  );

  console.log(
    "provider:",
    provider
  );

  console.log(
    "credential:",
    {
      hasCode: !!credential?.code,
      hasAccessToken: !!credential?.accessToken,
      hasIdToken: !!credential?.idToken,
    }
  );
console.log(
  "[GitHub OAuth] CLIENT_ID:",
  process.env.GITHUB_CLIENT_ID
);

console.log(
  "[GitHub OAuth] SECRET PRESENT:",
  !!process.env.GITHUB_CLIENT_SECRET
);
  const usecase =
    ctx.container.resolve<OAuthLoginUseCase>(
      TOKENS_AUTH.usecases.oauthLoginUseCase
    );

  const result =
    await usecase.execute({
      provider,
      credential,

      request: {
        ip:
          ctx.req.ip ||
          (ctx.req.headers[
            "x-forwarded-for"
          ] as string) ||
          "127.0.0.1",

        userAgent:
          ctx.req.headers[
            "user-agent"
          ] || "unknown",

        deviceId:
          (ctx.req.headers[
            "x-device-id"
          ] as string) || "unknown",
      },
    });

  console.log(
    "OAuth result:",
    result.status
  );

  if (result.status === "SUCCESS") {
    return {
      __typename: "AuthPayload",

      accessToken:
        result.accessToken,

      refreshToken:
        result.refreshToken,

      user: {
        __typename: "AuthUser",

        id:
          result.user.id,

        email:
          result.user.email,

        name:
          result.user.name,

        picture:
          result.user.picture,

        role:
          result.user.role ??
          "CUSTOMER",
      },
    };
  }

  // BLOCK / CHALLENGE

  // è¿™é‡Œæš‚æ—¶æŒ‰ç…§ä½ å½“å‰ GraphQL çš„è®¾è®¡ç»§ç»­å¤„ç†
},

    // â”€â”€ Refresh Token â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    refreshToken: async (
      _: unknown,
      { refreshToken }: { refreshToken: string },
      ctx: Context
    ) => {
      const sessionService = ctx.container.resolve<ISessionPort>(
        TOKENS_AUTH.ports.sessionPort
      );
     const userGateway = ctx.container.resolve<IUserGateway>(
      TOKENS_AUTH.ports.userGateway
     );
      
      try {
        // 1ï¸âƒ£ Verify the refresh token
        const decoded = jwt.verify(
          refreshToken,
          process.env.ACCESS_TOKEN_SECRET!
        ) as { sub: string; sessionId: string; type: string };

        if (decoded.type !== "refresh") {
          throw new Error("Invalid token type");
        }

        // 2ï¸âƒ£ Create new token pair
        const user = await userGateway.findById(decoded.sub);
        if (!user) throw new Error("User not found");
        const globalRole = requireGlobalRole(user.globalRole ?? user.role);
        const tokens = await sessionService.createSession({
          userId: decoded.sub,
          role: globalRole,
          email: user.email,
        });

        return {
          __typename: "AuthTokens",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      } catch (err) {
        throw new Error("Invalid or expired refresh token");
      }
    },

    // â”€â”€ Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    logout: async (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const sessionService = ctx.container.resolve<ISessionPort>(
        TOKENS_AUTH.ports.sessionPort
      );

      // Revoke current session (if sessionId is in the token)
      // In production, also revoke all user sessions
      await sessionService.revokeSession(ctx.user.userId);

      return true;
    },

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
      { challengeId, code }: { challengeId: string; code: string }, // âœ… ä¿®æ­£
      ctx: Context
    ) => {

      const usecase = ctx.container.resolve<VerifyOtpUseCase>(
        TOKENS_AUTH.usecases.verifyOtpUseCase
      );

      return usecase.execute({
        challengeId,
        otpCode: code, // âœ… å†…éƒ¨ç»Ÿä¸€
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
    user: (parent: any) => {
      if (parent.user) {
        return { __typename: "AuthUser", ...parent.user };
      }
      return parent.userId ? {
        __typename: "AuthUser",
        id: parent.userId,
      } : null;
    },
  },
}

