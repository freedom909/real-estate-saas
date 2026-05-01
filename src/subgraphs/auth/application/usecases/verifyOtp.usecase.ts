// auth/application/usecases/verifyOtp.usecase.ts
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import { inject, injectable } from "tsyringe";
import { EventBus } from "../../infrastructure/event/eventBus";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import ChallengeRepo from "../../infrastructure/repos/challenge.repo";
import { VerifyOtpCommand } from "../dto/verifyOtp.command";
import { OtpVerifiedEvent } from "../../domain/events/otpVerified.event";
import SessionPort from "../../domain/ports/session.port";

import { TrustedDevice } from "@/security/domain/entities/trustedDevice.entity";
import { ITrustedDeviceRepo } from "@/security/domain/repos/ITrustedDeviceRepo";
import { DeviceFingerprint } from "@/security/domain/valueObjects/deviceFingerprint";

@injectable()
export class VerifyOtpUseCase {
  constructor(
    @inject(TOKENS_AUTH.repos.challengeRepo)
    private challengeRepo: ChallengeRepo,

    @inject(TOKENS_AUTH.ports.sessionPort)
    private sessionPort: SessionPort,

    @inject(TOKENS_SECURITY.otpService)
    private otpService: OtpService,

    @inject(TOKENS_SECURITY.trustedDeviceRepo)
    private trustedDeviceRepo: ITrustedDeviceRepo,

    @inject(TOKENS_AUTH.eventBus)
    private eventBus: EventBus
  ) {}

  async execute(cmd: VerifyOtpCommand) {
    const { challengeId, otpCode, request } = cmd;

    const challenge = await this.challengeRepo.findById(challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const valid = await this.otpService.verify(challengeId, otpCode);

    if (!valid) throw new Error("Invalid OTP");

    await this.challengeRepo.markCompleted(challengeId);

    const trustedDevice = new TrustedDevice(
      challenge.userId,
      new DeviceFingerprint(request.deviceId, request.userAgent, request.ip),
      new Date(),
      new Date()
    );

    await this.trustedDeviceRepo.create(trustedDevice);

// auth/application/usecases/verifyOtp.usecase.ts
    const tokens = await this.sessionPort.createSession({
      userId: challenge.userId,
      deviceId: request.deviceId,
      ip: request.ip,
      userAgent: request.userAgent
    });

    await this.eventBus.emit(
      new OtpVerifiedEvent(
        challenge.userId,
        request.deviceId,
      )
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      status: "SUCCESS"
    };
  }
}
