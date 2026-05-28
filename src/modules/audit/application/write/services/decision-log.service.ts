import { inject, injectable } from "tsyringe";
import { IDecisionLogRepository } from "../../../domain/repositories/interface/decision-log.repository.interface";
import { DecisionLogDocument } from "../../../infrastructure/database/models/decision-log.model";
import { CreateDecisionLogDTO } from "../dto/create-decision-log.dto";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

import mongoose from "mongoose";

@injectable()
export class DecisionLogService {
  constructor(
    @inject(TOKENS_AUDIT.repos.decisionLog)
    private readonly repository: IDecisionLogRepository
  ) {}

  async writeDecisionLog(
    dto: CreateDecisionLogDTO
  ): Promise<DecisionLogDocument> {

const payload = {
  ...dto,

  actor: {
    ...dto.actor,

    userId: dto.actor.userId
      ? new mongoose.Types.ObjectId(
          dto.actor.userId
        )
      : undefined,
  },

  decision: {
    ...dto.decision,

    requiresHumanReview:
      dto.decision.requiresHumanReview ??
      false,
  },
};

    return await this.repository.create(payload);
  }
}