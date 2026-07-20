import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock("@/modules/tokens/auth.tokens", () => ({
  TOKENS_AUTH: {
    usecases: {
      oauthLoginUseCase: Symbol.for("OAuthLoginUseCase"),
      verifyOtpUseCase: Symbol.for("VerifyOtpUseCase"),
    },
    repos: {
      identityRepo: Symbol.for("IdentityRepository"),
    },
  },
}));

jest.mock("@/subgraphs/auth/guards/subgraphAuthGuard", () => ({
  subgraphAuthGuard: jest.fn(),
}));

jest.mock("@/security/blacklist/blacklist", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/subgraphs/auth/infrastructure/repos/identity.repo", () => ({
  IdentityRepository: class {},
}));

jest.mock("@/subgraphs/auth/application/usecases/login.usecase", () => ({
  OAuthLoginUseCase: class {},
}));

jest.mock("@/subgraphs/auth/application/usecases/verifyOtp.usecase", () => ({
  VerifyOtpUseCase: class {},
}));

import authResolvers from "@/subgraphs/auth/resolvers";

describe("Auth Resolvers", () => {
  describe("Query._authHealth", () => {
    it("should return true", () => {
      const result = (authResolvers as any).Query._authHealth();
      expect(result).toBe(true);
    });
  });

  describe("AuthPayload.user", () => {
    it("should return User with full user data when user object exists", () => {
      const parent = {
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "USER",
          picture: "avatar.jpg",
        },
      };

      const result = (authResolvers as any).AuthPayload.user(parent);

      expect(result).toEqual({
        __typename: "User",
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
        picture: "avatar.jpg",
      });
    });

    it("should return User with only id when only userId exists", () => {
      const parent = {
        userId: "user-1",
      };

      const result = (authResolvers as any).AuthPayload.user(parent);

      expect(result).toEqual({
        __typename: "User",
        id: "user-1",
      });
    });

    it("should return null when no user data exists", () => {
      const parent = {};

      const result = (authResolvers as any).AuthPayload.user(parent);

      expect(result).toBeNull();
    });
  });

  describe("Mutation.oauthLogin", () => {
    it("should return AuthPayload on SUCCESS status", async () => {
      const mockExecute = jest.fn<any>().mockResolvedValue({
        status: "SUCCESS",
        accessToken: "access-123",
        refreshToken: "refresh-123",
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "USER",
          picture: "avatar.jpg",
        },
      });

      const mockContainer = {
        resolve: jest.fn<any>().mockReturnValue({ execute: mockExecute }),
      };

      const mockReq = {
        ip: "127.0.0.1",
        headers: {
          "user-agent": "Chrome",
          "x-device-id": "dev-1",
        },
      };

      const ctx = {
        container: mockContainer,
        req: mockReq,
      };

      const result = await (authResolvers as any).Mutation.oauthLogin(
        null,
        { provider: "google", idToken: "token-123" },
        ctx
      );

      expect(result).toEqual({
        __typename: "AuthPayload",
        accessToken: "access-123",
        refreshToken: "refresh-123",
        user: {
          __typename: "User",
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "USER",
          picture: "avatar.jpg",
        },
      });
    });

    it("should return undefined for non-SUCCESS status", async () => {
      const mockExecute = jest.fn<any>().mockResolvedValue({
        status: "CHALLENGE",
        challengeId: "ch-1",
      });

      const mockContainer = {
        resolve: jest.fn<any>().mockReturnValue({ execute: mockExecute }),
      };

      const ctx = {
        container: mockContainer,
        req: { ip: "127.0.0.1", headers: {} },
      };

      const result = await (authResolvers as any).Mutation.oauthLogin(
        null,
        { provider: "google", idToken: "token-123" },
        ctx
      );

      expect(result).toBeUndefined();
    });
  });

  describe("Mutation.verifyOtp", () => {
    it("should call verifyOtpUseCase with correct params", async () => {
      const mockExecute = jest.fn<any>().mockResolvedValue({
        userId: "user-1",
        accessToken: "access-123",
        refreshToken: "refresh-123",
        status: "SUCCESS",
      });

      const mockContainer = {
        resolve: jest.fn<any>().mockReturnValue({ execute: mockExecute }),
      };

      const mockReq = {
        ip: "192.168.1.1",
        headers: {
          "user-agent": "Firefox",
          "x-device-id": "dev-2",
        },
      };

      const ctx = {
        container: mockContainer,
        req: mockReq,
      };

      const result = await (authResolvers as any).Mutation.verifyOtp(
        null,
        { challengeId: "ch-1", code: "123456" },
        ctx
      );

      expect(mockExecute).toHaveBeenCalledWith({
        challengeId: "ch-1",
        otpCode: "123456",
        request: {
          ip: "192.168.1.1",
          userAgent: "Firefox",
          deviceId: "dev-2",
        },
      });

      expect(result.status).toBe("SUCCESS");
    });

    it("should use default values for missing request headers", async () => {
      const mockExecute = jest.fn<any>().mockResolvedValue({ status: "SUCCESS" });

      const mockContainer = {
        resolve: jest.fn<any>().mockReturnValue({ execute: mockExecute }),
      };

      const ctx = {
        container: mockContainer,
        req: { headers: {} },
      };

      await (authResolvers as any).Mutation.verifyOtp(
        null,
        { challengeId: "ch-1", code: "123456" },
        ctx
      );

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          request: {
            ip: "127.0.0.1",
            userAgent: "unknown",
            deviceId: "unknown",
          },
        })
      );
    });
  });

  describe("Mutation.myIdentities", () => {
    it("should return identities for the user", async () => {
      const mockIdentities = [
        { id: "id-1", provider: "google", providerId: "g-123" },
      ];

      const mockIdentityRepo = {
        findByUser: jest.fn<any>().mockResolvedValue(mockIdentities),
      };

      const mockContainer = {
        resolve: jest.fn<any>().mockReturnValue(mockIdentityRepo),
      };

      const ctx = {
        container: mockContainer,
        user: { userId: "user-1" },
      };

      const result = await (authResolvers as any).Mutation.myIdentities(
        null,
        {},
        ctx
      );

      expect(mockIdentityRepo.findByUser).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockIdentities);
    });
  });
});
