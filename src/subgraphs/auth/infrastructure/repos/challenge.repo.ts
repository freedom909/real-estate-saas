// infrastructure/repos/challenge.repo.ts

import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { ChallengeModel } from "../models/challenge.model";
import { inject, injectable } from "tsyringe";
import Challenge from "../../domain/entities/challenge.entity";

@injectable()
export class ChallengeRepo {
  constructor(
    @inject(TOKENS_AUTH.models.challengeModel)
    private challengeModel: typeof ChallengeModel) {}
    async findById(id: string): Promise<Challenge | null> {
  const doc = await this.challengeModel.findById(id);

  if (!doc) return null;

  return new Challenge(
    doc.userId,
    doc.otpCode,
    doc.expiresAt?.toISOString(),
    "OTP",
    doc.updatedAt,
  );
}
}
export default ChallengeRepo;
