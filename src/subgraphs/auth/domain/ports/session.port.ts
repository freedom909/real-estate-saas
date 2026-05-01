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

  export default class SessionPort implements ISessionPort {
  revokeSession(sessionId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  createSession(input: {
    userId: string;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    throw new Error("Method not implemented.");
  }
}