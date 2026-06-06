//src/modules/audit/application/write/decision-log.service.ts
import { inject, injectable } from "tsyringe";
import { IDecisionLogRepository } from "../../../domain/repositories/interface/decision-log.repository.interface";
import { DecisionLog } from "../../../domain/types/decision-log.type";
import { CreateDecisionLogDTO } from "../dto/create-decision-log.dto";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

@injectable()
export class DecisionLogService {

  constructor(
    @inject(
      TOKENS_AUDIT.repos.decisionLogRepo
    )
    private readonly repository:
      IDecisionLogRepository
  ) {}

  async writeDecisionLog(
    dto: CreateDecisionLogDTO
  ): Promise<DecisionLog> {

    const payload = {
      ...dto,

      decision: {
        ...dto.decision,

        requiresHumanReview:
          dto.decision
            .requiresHumanReview ??
          false,
      },
    };

    return await this.repository
      .create(payload);
  }
}