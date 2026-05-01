// infrastructure/repos/challenge.repo.ts

import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { ChallengeModel } from "../models/challenge.model";
import { inject, injectable } from "tsyringe";
import Challenge from "../../domain/entities/challenge.entity";

@injectable()
export class ChallengeRepo {
  constructor(
    @inject(TOKENS_AUTH.models.challengeModel)
    private challengeModel: typeof ChallengeModel) { }
  async findById(id: string): Promise<Challenge | null> {
    const doc = await this.challengeModel.findById(id);

    if (!doc) return null;

    return new Challenge(
      doc._id.toString(),
      doc.userId ?? "",
      doc.deviceId ?? "",
      (doc.type as "OTP") || "OTP",
      doc.expiresAt ?? new Date(),
      doc.status as any
    );
  }

  async create(challenge: Partial<Challenge>): Promise<Challenge> {
    const doc = await this.challengeModel.create({
      userId: challenge.userId,
      deviceId: challenge.deviceId,
      type: challenge.type,
      expiresAt: challenge.expiresAt,
      status: challenge.status,
      createdAt: new Date(),
      updatedAt: new Date(), 
    });

    return new Challenge(
      doc._id.toString(),
      doc.userId ?? "",
      doc.deviceId ?? "",
      (doc.type as "OTP") || "OTP",
      doc.expiresAt ?? new Date(),
      doc.status as any
    );
  }

async markCompleted(challengeId): Promise<void>{
  await this.challengeModel.updateOne(
    { _id: challengeId },
    { status: "VERIFIED" }
  )
}

 isExpired(challenge: Challenge): boolean {
    return challenge.isExpired();
  }   
}
export default ChallengeRepo;
