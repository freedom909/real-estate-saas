//
// AgentRouterService.ts
import { ListingAIContext } from "@/subgraphs/listing/domain/entities/listingAIContext";

// AgentRouterService.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_AI }from "@/modules/tokens/ai.tokens";
import { RunListingAgentUseCase } from "@/subgraphs/listing/application/use-cases/RunListingAgentUseCase";
import { RunBookingAgentUseCase } from "@/subgraphs/booking/use-cases/RunBookingAgentUseCase";



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
