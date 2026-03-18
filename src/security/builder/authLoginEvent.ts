// src/security/builder/authLoginEvent.ts

import { SecurityEventBuilder, SecurityEvent } from "./securityEvent.builder";

interface User {
  userId: string;
  role: string;
  [key: string]: any;
}

interface Request {
  ip: string;
  headers: {
    [key: string]: string | undefined;
  };
  method: string;
  path: string;
  body: any;
  metrics?: {
    requestRate: number;
    recentActions: any[];
  };
}

interface Token {
  sub: string;
  role: string;
  iat: number;
  [key: string]: any;
}


export const buildAuthLoginEvent = ({
  user,
  req,
  failedLoginCount
}: {
  user: User;
  req: Request;
  failedLoginCount: number;
}): SecurityEvent =>
  SecurityEventBuilder.create('AUTH_LOGIN')
    .withActor({
      userId: user.userId,
      role: user.role,
    })
    .withContext({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })
    .withSignals({
      failedLoginCount,
    })
    .build();



export const buildApiRequestEvent = ({
  req,
  user
}: {
  req: Request;
  user: User;
}): SecurityEvent => SecurityEventBuilder.create('API_REQUEST')
  .withActor({
    userId: user.userId,
    role: user.role,
  })
  .withContext({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    method: req.method,//オブジェクト リテラルは既知のプロパティのみ指定できます。'method' は型 'Context' に存在しません。
    path: req.path,
    payloadSize: JSON.stringify(req.body).length,
  })
  .withSignals({
    requestRate: req.metrics?.requestRate,
    recentActions: req.metrics?.recentActions,
  })
  .build();

export const buildTokenUsageEvent = ({
  token,
  req
}: {
  token: Token;
  req: Request;
}): SecurityEvent =>
  SecurityEventBuilder.create('TOKEN_USAGE')
    .withActor({
      userId: token.sub,
      role: token.role,
    })
    .withSignals({
      tokenAgeSec: (Date.now() - token.iat) / 1000,
    })
    .build();