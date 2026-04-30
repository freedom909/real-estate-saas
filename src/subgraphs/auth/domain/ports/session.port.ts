// domain/ports/session.port.ts


export interface ISessionPort {
  createSession(input: {
    userId: string;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  revokeSession(sessionId: string): Promise<void>;
}