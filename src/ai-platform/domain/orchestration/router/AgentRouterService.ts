import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { RunListingAgentUseCase } from "@/subgraphs/listing/application/use-cases/RunListingAgentUseCase";
import { RunBookingAgentUseCase } from "@/subgraphs/booking/use-cases/RunBookingAgentUseCase";

// These use cases should be moved to their respective subgraphs per Rule 1


@injectable()
export class AgentRouterService {
    constructor(
        @inject(TOKENS_AI.usecase.runListingAgentUseCase)
        private listingUseCase: RunListingAgentUseCase,

        @inject(TOKENS_AI.usecase.runBookingAgentUseCase)
        private bookingUseCase: RunBookingAgentUseCase,
    ) {}

    /**
     * Routes the AI task to the appropriate domain-specific agent use case.
     */
    async execute(input: { type: string; [key: string]: any }) {
        switch (input.type) {
            case "LISTING":
                return this.listingUseCase.execute(input);

            case "BOOKING":
                return this.bookingUseCase.execute(input.bookingId as string);

            default:
                throw new Error(`Unsupported AI task type: ${input.type}`);    
        }
    }
}