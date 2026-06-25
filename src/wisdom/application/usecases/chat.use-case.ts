// src/wisdom/application/usecases/chat.use-case.ts

import { inject, injectable } from "tsyringe";
import { WisdomOrchestrator } from "../../orchestration/wisdom-orchestrator";
import { WisdomRequest } from "../../contracts/request";
import { WisdomResponse } from "../../contracts/response";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";

@injectable()
export class ChatUseCase {
  constructor(
    @inject(WISDOM_TOKENS.orchestrator)
    private orchestrator: WisdomOrchestrator,
  ) {}

  async execute(request: WisdomRequest): Promise<WisdomResponse> {
    return await this.orchestrator.handle(request);
  }
}
