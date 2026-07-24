// domain/ports/session.port.ts


export interface ISessionPort {
  createSession(input: {
    userId: string;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    email?: string | null; // Add email to the session creation input
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  revokeSession(sessionId: string): Promise<void>;
  updateActiveTenant(sessionId: string, tenantId: string): Promise<void>;
  findSessionById(sessionId: string): Promise<{ activeTenantId?: string | null } | null>;
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
    email?: string | null; // Add email to the session creation input
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    throw new Error("Method not implemented.");
  }
  updateActiveTenant(_sessionId: string, _tenantId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findSessionById(_sessionId: string): Promise<{ activeTenantId?: string | null } | null> {
    throw new Error("Method not implemented.");
  }
}