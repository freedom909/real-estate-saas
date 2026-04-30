import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import { inject, injectable } from "tsyringe";
import { EventBus } from "../../infrastructure/event/eventBus";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import ChallengeRepo from "../../infrastructure/repos/challenge.repo";
import { VerifyOtpCommand } from "../dto/verifyOtp.command";
import { OtpVerifiedEvent } from "../../domain/events/otpVerified.event";
import SessionRepository from "../../infrastructure/repos/session.repo";

@injectable()
export class VerifyOtpUseCase {
  constructor(
    @inject(TOKENS_AUTH.repos.challengeRepo)
    private challengeRepo: ChallengeRepo,

    @inject(TOKENS_AUTH.repos.sessionRepo)
    private sessionRepo: SessionRepository,

    @inject(TOKENS_SECURITY.eventBus)
    private eventBus: EventBus
  ) {}

  async execute(cmd: VerifyOtpCommand) {
    const challenge = await this.challengeRepo.findById(cmd.challengeId);

    if (!challenge) throw new Error("Invalid challenge");

    if (!challenge.verify(cmd.otpCode)) {
      throw new Error("Invalid OTP");
    }

    if (challenge.isExpired()) {
      throw new Error("Expired");
    }

    // ✅ 发事件（核心）
    await this.eventBus.emit(
      new OtpVerifiedEvent(
        challenge.userId,
        cmd.request.deviceId
      )
    );

    // ✅ 创建 session
    return this.sessionRepo.create({
      userId: challenge.userId,
      deviceId: cmd.request.deviceId,
      familyId: cmd.request.deviceId,
      refreshTokenId: cmd.request.deviceId,
      ipHash: cmd.request.ip,
      userAgentHash: cmd.request.userAgent,
      expiresAt: new Date(),
         })
  }
}