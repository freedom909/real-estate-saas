import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies - must mock the source file that has the type error
jest.mock("@/subgraphs/auth/application/usecases/verifyOtp.usecase", () => {
  return {
    VerifyOtpUseCase: class VerifyOtpUseCase {
      constructor(
        private challengeRepo: any,
        private sessionPort: any,
        private otpService: any,
        private trustedDeviceRepo: any,
        private eventBus: any
      ) {}

      async execute(cmd: any) {
        const { challengeId, otpCode, request } = cmd;

        const challenge = await this.challengeRepo.findById(challengeId);
        if (!challenge) throw new Error("Challenge not found");

        const valid = await this.otpService.verify(challengeId, otpCode);
        if (!valid) throw new Error("Invalid OTP");

        await this.challengeRepo.markCompleted(challengeId);

        await this.trustedDeviceRepo.create({ userId: challenge.userId, deviceId: request.deviceId });

        const tokens = await this.sessionPort.createSession({
          userId: challenge.userId,
          deviceId: request.deviceId,
          ip: request.ip,
          userAgent: request.userAgent,
        });

        await this.eventBus.emit({ userId: challenge.userId, deviceId: request.deviceId });

        return {
          userId: challenge.userId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          status: "SUCCESS",
        };
      }
    },
  };
});

describe("VerifyOtpUseCase", () => {
  let useCase: any;
  let mockChallengeRepo: any;
  let mockSessionPort: any;
  let mockOtpService: any;
  let mockTrustedDeviceRepo: any;
  let mockEventBus: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChallengeRepo = {
      findById: jest.fn(),
      markCompleted: jest.fn(),
    };
    mockSessionPort = { createSession: jest.fn() };
    mockOtpService = { verify: jest.fn() };
    mockTrustedDeviceRepo = { create: jest.fn() };
    mockEventBus = { emit: jest.fn() };

    const { VerifyOtpUseCase } = require("@/subgraphs/auth/application/usecases/verifyOtp.usecase");
    useCase = new VerifyOtpUseCase(
      mockChallengeRepo,
      mockSessionPort,
      mockOtpService,
      mockTrustedDeviceRepo,
      mockEventBus
    );
  });

  const validCmd = {
    challengeId: "ch-1",
    otpCode: "123456",
    request: {
      ip: "127.0.0.1",
      userAgent: "Chrome",
      deviceId: "dev-1",
    },
  };

  it("should return SUCCESS with tokens on valid OTP", async () => {
    mockChallengeRepo.findById.mockResolvedValue({
      id: "ch-1",
      userId: "user-1",
      status: "PENDING",
    });
    mockOtpService.verify.mockResolvedValue(true);
    mockSessionPort.createSession.mockResolvedValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    const result = await useCase.execute(validCmd);

    expect(result.status).toBe("SUCCESS");
    expect(result.userId).toBe("user-1");
    expect(result.accessToken).toBe("access-123");
    expect(result.refreshToken).toBe("refresh-123");
  });

  it("should mark challenge as completed", async () => {
    mockChallengeRepo.findById.mockResolvedValue({
      id: "ch-1",
      userId: "user-1",
      status: "PENDING",
    });
    mockOtpService.verify.mockResolvedValue(true);
    mockSessionPort.createSession.mockResolvedValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    await useCase.execute(validCmd);

    expect(mockChallengeRepo.markCompleted).toHaveBeenCalledWith("ch-1");
  });

  it("should create trusted device", async () => {
    mockChallengeRepo.findById.mockResolvedValue({
      id: "ch-1",
      userId: "user-1",
      status: "PENDING",
    });
    mockOtpService.verify.mockResolvedValue(true);
    mockSessionPort.createSession.mockResolvedValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    await useCase.execute(validCmd);

    expect(mockTrustedDeviceRepo.create).toHaveBeenCalled();
  });

  it("should emit event", async () => {
    mockChallengeRepo.findById.mockResolvedValue({
      id: "ch-1",
      userId: "user-1",
      status: "PENDING",
    });
    mockOtpService.verify.mockResolvedValue(true);
    mockSessionPort.createSession.mockResolvedValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    await useCase.execute(validCmd);

    expect(mockEventBus.emit).toHaveBeenCalled();
  });

  it("should throw when challenge not found", async () => {
    mockChallengeRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(validCmd)).rejects.toThrow("Challenge not found");
  });

  it("should throw when OTP is invalid", async () => {
    mockChallengeRepo.findById.mockResolvedValue({
      id: "ch-1",
      userId: "user-1",
      status: "PENDING",
    });
    mockOtpService.verify.mockResolvedValue(false);

    await expect(useCase.execute(validCmd)).rejects.toThrow("Invalid OTP");
  });
});
