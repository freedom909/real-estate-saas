// src/subgraphs/ai/application/usecases/RunListingAgentUseCase.ts

import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ListingOptimizationAgent } from "../agents/listingOptimizationAgent";
import { ListingAIContext } from "../../domain/entities/listingAI.context";


@injectable()
export class RunListingAgentUseCase { 
  constructor(
    @inject(TOKENS_AI.agent.listingOptimizationAgent)
    private listingOptimizationAgent: ListingOptimizationAgent,
  ) {}

  async execute(context: ListingAIContext) {
    return this.listingOptimizationAgent.execute(context);
  }
}