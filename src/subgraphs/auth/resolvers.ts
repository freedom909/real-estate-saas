//src/subgraphs/authz/resolvers/index.ts
console.log(typeof IdentityModel);

// src/subgraphs/auth/resolver.ts

import { setAuthCookies } from "../../infrastructure/auth/setAuthCookies.js";
import type { Request, Response } from "express";
import type {OAuthAdapter} from "./adapters/oauth/oauth.adapter.js";

import { container } from "tsyringe";
import RefreshTokenService from "./services/refreshToken.service";

// import {OAuthService} from "./services/oauth.service";
import { subgraphAuthGuard } from "./guards/subgraphAuthGuard";
import { IdentityModel } from "../user/models/identity.model.js";
import { OAuthLoginService } from "./services/oauth.login.service.js";
import { TokenService } from "./services/token.service.js";
import { ForbiddenError } from "../../infrastructure/utils/errors.js";
import { TOKENS_AUTH } from "../../modules/auth/container/auth.tokens.js";
import AuthService from "./services/auth.service.js";
import { OAuthProvider } from "./adapters/normalized.oauth.profile.js";



interface User {
  userId: string;
  [key: string]: any;
}

interface Context {
  user?: User;
  container: typeof container;
  req: Request;
  res: Response;
  redis?: any;
  userClient: any;
  tokenService: TokenService;
  blacklist: TokenService;
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
   
   listOAuthAccounts:async (_: unknown, __: unknown, ctx: Context) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const authService=container.resolve<AuthService>(TOKENS_AUTH.services.authService);
    return authService.listOAuthAccounts(ctx.user.userId);   
   },
   

    mySessions: withAuth(
      async (_: unknown, __: unknown, { container, user }: Context) => {
        if (!user) throw new ForbiddenError("Unauthorized");

        const authService = container.resolve<AuthService>(TOKENS_AUTH.services.authService) ;

        return authService.getMySessions(user.userId);
      },
      subgraphAuthGuard
    ),
    OnlineSessions: async (_: unknown, __: unknown, ctx: Context) => {
      return requireScope(["session:read"])(
        ctx,
        () =>
          listOnlineSessions(ctx.redis!)
            .filter(
              (s: any) => s.userId === ctx.user!.userId
            )
      );
    },
  },

  Mutation: {
   
    oauthLogin: async (
      _: any,
      { provider, idToken }: { provider: string; idToken: string },
      { req }: Context
    ) => {

      try {
      const loginService = container.resolve<OAuthLoginService>(TOKENS_AUTH.services.oauthloginService);
      const normalizedProvider = provider.toLowerCase() as OAuthProvider;
      return loginService.oauthLogin(normalizedProvider as OAuthProvider, idToken, req
       );
    }catch (err) {
    console.error("❌ resolve error:", err);
    throw err;
  }
    },


refreshToken: async (_: unknown, { refreshToken }: { refreshToken: string }, ctx: Context) => {

  const refreshTokenService = container.resolve<RefreshTokenService>(TOKENS_AUTH.services.refreshTokenService)
    return refreshTokenService.refresh(refreshToken,ctx.userClient) 
},

    revokeToken: async (_: unknown, __: unknown, { user }: Context) => {
      if (!user) throw new Error("Unauthorized");

      const service = container.resolve<RefreshTokenService>(TOKENS_AUTH.services.refreshTokenService);
      await service.revokeAll(user.userId);

      return true;
    },

    bindOAuth: async (_: unknown, { provider, idToken }: { provider: string; idToken: string }, { req, user }: Context & { provider: string; idToken: string }) => {
      if (!user) throw new Error("Unauthorized");

      const oauthService = container.resolve<AuthService>(TOKENS_AUTH.services.oauthService);

      return oauthService.bindOAuthAccount(
        user.userId,
        provider,
        idToken,
        {
          ip: req.ip,
          deviceId: req.headers["x-device-id"] as string,
        }
      );
    },

    // unbindOAuth: async (_: unknown, { provider }:{provider: string}, {  req, user }: Context & { provider: string }) => {
    //   if (!user) throw new Error("Unauthorized");

    //   const authService = container.resolve<AuthService>(TOKENS_AUTH.services.authService);

    //   return authService.unbindOAuthAccount(
    //     user.userId,
    //     provider,
    //     {
    //       ip: req.ip as string,
    //       deviceId?: req.headers["x-device-id"]??undefined,
    //     }
    //   );
    // },

  unbindOAuthAccount: async (_: unknown, { provider }: { provider: string }, {  req, user}: Context) => {
  if (!user) {
  throw new Error("Cannot unbind last login method");
    } 
const userService=container.resolve<AuthService>(TOKENS_AUTH.services.authService);
    return userService.unbindOAuthAccount(
      user.userId ,
      provider,
      {
          ip: req.ip as string,
          deviceId: req.headers["x-device-id"] as string,
        }
    );
  },

    logout: async (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
      const refreshTokenService = container.resolve<RefreshTokenService>(TOKENS_AUTH.services.refreshTokenService);
      await refreshTokenService.revokeAll(ctx.user.userId);
      
      return true;
    },


revokeSession: async (
  _: unknown,
  { sessionId }: { sessionId: string },
  ctx: Context
) => {

  if (!ctx.user) {
    throw new Error("Authentication required");
  }

  const token = ctx.req.headers.authorization?.replace("Bearer ", "");

  const authService = container.resolve<AuthService>(
    TOKENS_AUTH.services.authService
  );

  return authService.revokeSession(
    ctx.user.userId,
    sessionId,
    token
  );
}
  },

  // ✅ ✅ ✅ 类型 resolver 在这里
  AuthPayload: {
    user: (parent: AuthPayload) => ({
      __typename: "User",
      id: parent.userId.toString(),
    }),
  },
};