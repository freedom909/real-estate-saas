//
// AgentRouterService.ts
import { ListingAIContext } from "@/subgraphs/ai/domain/entities/contexts/ListingAIContext";

// AgentRouterService.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_AI }from "@/modules/tokens/ai.tokens";

import { RunListingAgentUseCase } from "../usecases/RunListingAgentUseCase";

import { RunBookingAgentUseCase } from "../usecases/RunBookingAgentUseCase";

@injectable()
export class AgentRouterService {

    constructor(

        @inject(TOKENS_AI.usecase.runListingAgentUseCase)
        private listingUseCase: RunListingAgentUseCase,

        @inject(TOKENS_AI.usecase.runBookingAgentUseCase)
        private bookingUseCase: RunBookingAgentUseCase,
    ) {}

    async execute(input: any) {
        switch (input.type) {

            case "LISTING":
                return this.listingUseCase.execute(input);

            case "BOOKING":
                return this.bookingUseCase.execute(input);

            default:
                throw new Error("Unknown AI task type");    
        }
    }
}
