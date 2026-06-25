// src/wisdom/agents/agent-router.ts

import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../contracts/agent";
import { SemanticContext } from "../semantic/semantic-context";
import { AIDomain } from "../shared/enums/domain.enum";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";

@injectable()
export class AgentRouter {
  constructor(
    @inject(WISDOM_TOKENS.agents.listingAgent)
    private listingAgent: IDomainAgent,

    @inject(WISDOM_TOKENS.agents.bookingAgent)
    private bookingAgent: IDomainAgent,

    @inject(WISDOM_TOKENS.agents.generalAgent)
    private generalAgent: IDomainAgent,
  ) {}

  route(semantic: SemanticContext): IDomainAgent {
    switch (semantic.domain) {
      case AIDomain.LISTING:
        return this.listingAgent;
      case AIDomain.BOOKING:
        return this.bookingAgent;
      case AIDomain.GENERAL:
      case AIDomain.REVIEW:
      case AIDomain.UNKNOWN:
      default:
        return this.generalAgent;
    }
  }
}
