import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import "reflect-metadata";

// -------------------------------------------------------------------------
// Mock Types
// -------------------------------------------------------------------------

type GoogleProfile = {
  email: string;
  sub: string;
  name: string;
  picture: string;
};

type User = {
  id: string;
  email: string;
};

type Session = {
  id: string;
  userId: string;
  deviceId: string;
  familyId: string;
  ip: string;
  userAgent: string;
  refreshTokenId: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

// -------------------------------------------------------------------------
// Mocks
// -------------------------------------------------------------------------

const mockGoogleAdapter = {
  verifyToken: jest.fn(),
} as any;

const mockUserAdapter = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
} as any;

const mockSessionService = {
  createSession: jest.fn(),
} as any;

const mockTokenHelper = {
  generateJti: jest.fn(),
  issueTokens: jest.fn(),
} as any;

// -------------------------------------------------------------------------
// Service Implementation (Under Test)
// -------------------------------------------------------------------------

interface LoginParams {
  idToken: string;
  ip: string;
  userAgent: string;
  deviceId: string;
}

class OAuthLoginService {
  constructor(
    private googleAdapter: any,
    private userAdapter: any,
    private sessionService: any,
    private tokenHelper: any
  ) {}

  async loginWithGoogle(params: LoginParams) {
    let profile: GoogleProfile;

    try {
      profile = await this.googleAdapter.verifyToken(params.idToken);
    } catch {
      throw new Error("Invalid OAuth Token");
    }

    let user = await this.userAdapter.findByEmail(profile.email);

    if (!user) {
      user = await this.userAdapter.createUser({
        email: profile.email,
        googleId: profile.sub,
        fullName: profile.name,
        avatarUrl: profile.picture,
      });
    }

    const refreshTokenId = this.tokenHelper.generateJti();

    const session = await this.sessionService.createSession({
      userId: user.id,
      deviceId: params.deviceId,
      ip: params.ip,
      userAgent: params.userAgent,
      refreshTokenId,
      familyId: this.tokenHelper.generateJti(),
    });

    const tokens = this.tokenHelper.issueTokens(
      user.id,
      session.id,
      refreshTokenId
    );

    return {
      user,
      tokens,
      sessionId: session.id,
    };
  }
}

// -------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------

describe("OAuthLoginService", () => {
  let service: OAuthLoginService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new OAuthLoginService(
      mockGoogleAdapter,
      mockUserAdapter,
      mockSessionService,
      mockTokenHelper
    );
  });

  const loginParams = {
    idToken: "google-jwt-123",
    ip: "127.0.0.1",
    userAgent: "Chrome/90",
    deviceId: "dev-001",
  };

  const googleProfile: GoogleProfile = {
    email: "test@example.com",
    sub: "google-123",
    name: "Test User",
    picture: "http://avatar.jpg",
  };

  const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
  };

  const mockSession: Session = {
    id: "sess-1",
    userId: "user-1",
    deviceId: "dev-001",
    familyId: "family-1",
    ip: "127.0.0.1",
    userAgent: "Chrome/90",
    refreshTokenId: "jti-1",
  };

  const mockTokens: Tokens = {
    accessToken: "access-123",
    refreshToken: "refresh-123",
  };

  it("should login an EXISTING user successfully", async () => {
    mockGoogleAdapter.verifyToken.mockResolvedValue(googleProfile);
    mockUserAdapter.findByEmail.mockResolvedValue(mockUser);

    mockTokenHelper.generateJti.mockReturnValue("jti-1");

    mockSessionService.createSession.mockResolvedValue(mockSession);

    mockTokenHelper.issueTokens.mockReturnValue(mockTokens);

    const result = await service.loginWithGoogle(loginParams);

    expect(mockGoogleAdapter.verifyToken).toHaveBeenCalledWith(
      loginParams.idToken
    );

    expect(mockUserAdapter.findByEmail).toHaveBeenCalledWith(
      googleProfile.email
    );

    expect(mockUserAdapter.createUser).not.toHaveBeenCalled();

    expect(mockSessionService.createSession).toHaveBeenCalled();

    expect(result).toEqual({
      user: mockUser,
      tokens: mockTokens,
      sessionId: mockSession.id,
    });
  });

  it("should register and login a NEW user successfully", async () => {
    mockGoogleAdapter.verifyToken.mockResolvedValue(googleProfile);
    mockUserAdapter.findByEmail.mockResolvedValue(null);

    const newUser = { id: "user-new", email: googleProfile.email };

    mockUserAdapter.createUser.mockResolvedValue(newUser);

    mockTokenHelper.generateJti.mockReturnValue("jti-1");

    mockSessionService.createSession.mockResolvedValue(mockSession);

    mockTokenHelper.issueTokens.mockReturnValue(mockTokens);

    const result = await service.loginWithGoogle(loginParams);

    expect(mockUserAdapter.createUser).toHaveBeenCalled();

    expect(result.user).toEqual(newUser);
  });

  it("should throw if OAuth Token is invalid", async () => {
    mockGoogleAdapter.verifyToken.mockRejectedValue(new Error("Invalid"));

    await expect(service.loginWithGoogle(loginParams)).rejects.toThrow(
      "Invalid OAuth Token"
    );

    expect(mockUserAdapter.findByEmail).not.toHaveBeenCalled();
  });

  it("should throw if User Adapter fails", async () => {
    mockGoogleAdapter.verifyToken.mockResolvedValue(googleProfile);
    mockUserAdapter.findByEmail.mockRejectedValue(
      new Error("User Service Down")
    );

    await expect(service.loginWithGoogle(loginParams)).rejects.toThrow(
      "User Service Down"
    );
  });

  it("should throw if user creation fails", async () => {
    mockGoogleAdapter.verifyToken.mockResolvedValue(googleProfile);
    mockUserAdapter.findByEmail.mockResolvedValue(null);
    mockUserAdapter.createUser.mockRejectedValue(new Error("DB Error"));

    await expect(service.loginWithGoogle(loginParams)).rejects.toThrow(
      "DB Error"
    );
  });

  it("should throw if session creation fails", async () => {
    mockGoogleAdapter.verifyToken.mockResolvedValue(googleProfile);
    mockUserAdapter.findByEmail.mockResolvedValue(mockUser);

    mockSessionService.createSession.mockRejectedValue(
      new Error("Redis Down")
    );

    await expect(service.loginWithGoogle(loginParams)).rejects.toThrow(
      "Redis Down"
    );
  });
});