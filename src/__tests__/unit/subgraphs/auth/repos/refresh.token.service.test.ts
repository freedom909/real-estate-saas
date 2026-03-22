import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

// -------------------------------------------------------------------------
// Types (🔥 关键：避免 TS 推断成 never)
// -------------------------------------------------------------------------

interface TokenPayload {
  sessionId: string;
  jti: string;
  userId: string;
}

interface Session {
  id: string;
  userId: string;
  refreshTokenId: string;
  familyId: string;
  revokedAt: Date | null;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RiskResult {
  shouldFreeze: boolean;
}

// -------------------------------------------------------------------------
// Mocks（🔥 全部强类型）
// -------------------------------------------------------------------------

const mockSessionService = {
  findBySessionId: jest.fn<(id: string) => Promise<Session | null>>(),
  updateRefreshTokenId: jest.fn<(id: string, jti: string) => Promise<void>>(),
  revokeSession: jest.fn<(id: string) => Promise<void>>(),
  revokeFamily: jest.fn<(id: string) => Promise<void>>(),
};

const mockRiskPolicyService = {
  evaluateRisk: jest.fn<(events: any[]) => Promise<RiskResult>>(),
};

const mockTokenHelper = {
  verify: jest.fn<(token: string) => TokenPayload>(),
  generateJti: jest.fn<() => string>(),
  issueTokens: jest.fn<(userId: string, sessionId: string, jti: string) => TokenPair>(),
};

const mockRiskRepo = {
  logEvent: jest.fn<(event: any) => Promise<void>>(),
};

// -------------------------------------------------------------------------
// Service Under Test
// -------------------------------------------------------------------------

class RefreshTokenService {
  constructor(
    private sessionService: typeof mockSessionService,
    private riskService: typeof mockRiskPolicyService,
    private tokenHelper: typeof mockTokenHelper,
    private riskRepo: typeof mockRiskRepo
  ) {}

  async refreshUserToken(refreshToken: string): Promise<TokenPair> {
    // 1. verify
    const payload = this.tokenHelper.verify(refreshToken);

    // 2. find session
    const session = await this.sessionService.findBySessionId(payload.sessionId);

    if (!session) throw new Error("Session not found");
    if (session.revokedAt) throw new Error("Session is revoked");

    // 3. reuse detection
    if (session.refreshTokenId !== payload.jti) {
      await this.riskRepo.logEvent({
        type: "refreshToken_REUSE",
        userId: session.userId,
        timestamp: new Date(),
      });

      const risk = await this.riskService.evaluateRisk([
        { type: "refreshToken_REUSE", timestamp: new Date() },
      ]);

      if (risk.shouldFreeze) {
        await this.sessionService.revokeFamily(session.familyId);
      } else {
        await this.sessionService.revokeSession(session.id);
      }

      throw new Error("Invalid refresh token (Reuse Detected)");
    }

    // 4. rotate
    const newJti = this.tokenHelper.generateJti();

    await this.sessionService.updateRefreshTokenId(session.id, newJti);

    // 5. issue
    return this.tokenHelper.issueTokens(
      session.userId,
      session.id,
      newJti
    );
  }
}

// -------------------------------------------------------------------------
// TEST SUITE
// -------------------------------------------------------------------------

describe("RefreshTokenService", () => {
  let service: RefreshTokenService;

  const FIXED_DATE = new Date("2024-01-01T12:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);

    service = new RefreshTokenService(
      mockSessionService,
      mockRiskPolicyService,
      mockTokenHelper,
      mockRiskRepo
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const validToken = "valid.jwt.token";

  const payload: TokenPayload = {
    sessionId: "sess-123",
    jti: "jti-old",
    userId: "user-1",
  };

  const session: Session = {
    id: "sess-123",
    userId: "user-1",
    refreshTokenId: "jti-old",
    familyId: "fam-1",
    revokedAt: null,
  };

  // -----------------------------------------------------------------------
  // ✅ SUCCESS FLOW
  // -----------------------------------------------------------------------

  it("should rotate token successfully", async () => {
    mockTokenHelper.verify.mockReturnValue(payload);

    mockSessionService.findBySessionId.mockResolvedValue(session);

    mockTokenHelper.generateJti.mockReturnValue("jti-new");

    mockTokenHelper.issueTokens.mockReturnValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    const result = await service.refreshUserToken(validToken);

    expect(mockTokenHelper.verify).toHaveBeenCalledWith(validToken);

    expect(mockSessionService.updateRefreshTokenId).toHaveBeenCalledWith(
      "sess-123",
      "jti-new"
    );

    expect(mockTokenHelper.issueTokens).toHaveBeenCalledWith(
      "user-1",
      "sess-123",
      "jti-new"
    );

    expect(result).toEqual({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });
  });

  // -----------------------------------------------------------------------
  // ❌ ERROR CASES
  // -----------------------------------------------------------------------

  it("should throw if verify fails", async () => {
    mockTokenHelper.verify.mockImplementation(() => {
      throw new Error("Expired");
    });

    await expect(service.refreshUserToken("bad")).rejects.toThrow("Expired");

    expect(mockSessionService.findBySessionId).not.toHaveBeenCalled();
  });

  it("should throw if session not found", async () => {
    mockTokenHelper.verify.mockReturnValue(payload);
    mockSessionService.findBySessionId.mockResolvedValue(null);

    await expect(service.refreshUserToken(validToken)).rejects.toThrow(
      "Session not found"
    );
  });

  it("should throw if session revoked", async () => {
    mockTokenHelper.verify.mockReturnValue(payload);
    mockSessionService.findBySessionId.mockResolvedValue({
      ...session,
      revokedAt: new Date(),
    });

    await expect(service.refreshUserToken(validToken)).rejects.toThrow(
      "Session is revoked"
    );
  });

  // -----------------------------------------------------------------------
  // 🚨 SECURITY: TOKEN REUSE
  // -----------------------------------------------------------------------

  it("should detect reuse and revoke session (LOW risk)", async () => {
    const stolenPayload = { ...payload, jti: "stolen-jti" };

    mockTokenHelper.verify.mockReturnValue(stolenPayload);

    mockSessionService.findBySessionId.mockResolvedValue({
      ...session,
      refreshTokenId: "current-jti",
    });

    mockRiskPolicyService.evaluateRisk.mockResolvedValue({
      shouldFreeze: false,
    });

    await expect(service.refreshUserToken(validToken)).rejects.toThrow(
      /Reuse Detected/
    );

    expect(mockRiskRepo.logEvent).toHaveBeenCalled();

    expect(mockSessionService.revokeSession).toHaveBeenCalledWith("sess-123");

    expect(mockSessionService.revokeFamily).not.toHaveBeenCalled();
  });

  it("should detect reuse and revoke family (HIGH risk)", async () => {
    const stolenPayload = { ...payload, jti: "stolen-jti" };

    mockTokenHelper.verify.mockReturnValue(stolenPayload);

    mockSessionService.findBySessionId.mockResolvedValue({
      ...session,
      refreshTokenId: "current-jti",
    });

    mockRiskPolicyService.evaluateRisk.mockResolvedValue({
      shouldFreeze: true,
    });

    await expect(service.refreshUserToken(validToken)).rejects.toThrow(
      /Reuse Detected/
    );

    expect(mockSessionService.revokeFamily).toHaveBeenCalledWith("fam-1");

    expect(mockSessionService.revokeSession).not.toHaveBeenCalled();
  });
});