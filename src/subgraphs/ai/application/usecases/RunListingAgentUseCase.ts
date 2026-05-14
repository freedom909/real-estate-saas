// src/subgraphs/ai/application/usecases/RunListingAgentUseCase.ts

import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ListingAIContext } from "../../domain/entities/contexts/ListingAIContext";
import { ListingOptimizationAgent } from "../agents/listing/ListingOptimizationAgent";

@injectable()
export class RunListingAgentUseCase { //is this redundant? 
  constructor(
    @inject(TOKENS_AI.agent.listingOptimizationAgent)
    private listingOptimizationAgent: ListingOptimizationAgent,
  ) {}

  async execute(context: ListingAIContext) {
    return this.listingOptimizationAgent.execute(context);
  }
}