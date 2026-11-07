// src/subgraphs/auth/domain/ports/session.port.ts
export interface ActiveSession {
  sessionId: string;
  userId: string;
  refreshTokenId: string;
  activeTenantId: string | null;
}

export interface ISessionPort {
  createSession(input: {
    userId: string;
    role?: string | null;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    email?: string | null;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  revokeSession(sessionId: string): Promise<void>;

  updateActiveTenant(
    userId: string,
    sessionId: string,
    tenantId: string
  ): Promise<void>;

  findSessionById(
    sessionId: string,
    userId: string
  ): Promise<ActiveSession | null>;

  rotateRefreshTokenId(input: {
    sessionId: string;
    userId: string;
    oldRefreshTokenId: string;
    newRefreshTokenId: string;
  }): Promise<boolean>;
}
