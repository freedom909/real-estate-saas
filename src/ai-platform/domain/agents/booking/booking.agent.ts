// src/ai-platform/domain/agents/booking/booking.agent.ts

import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";

import { AgentAction, EntityType, SemanticContext} from "../../semantic/semantic-context";

import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

import { CancelBookingUseCase } from "@/subgraphs/booking/application/use-cases/cancel-booking.use-case";
import { CreateBookingUseCase } from "@/subgraphs/booking/application/use-cases/create-booking.use-case";
import { AIContext } from "@/ai-platform/context/types/context/aiContext";


@injectable()
export class BookingAgent implements IDomainAgent {

  constructor(
    @inject(TOKENS_AI.usecase.cancelBookingUseCase)
    private cancelBookingUseCase:CancelBookingUseCase,

    @inject(TOKENS_AI.usecase.createBookingUseCase) 
    private createBookingUseCase:CreateBookingUseCase,

  ) {}

  async execute(
    semantic: SemanticContext,
    context:AIContext
  ) {

    switch(
      semantic.action[0]?.name || semantic.action[0]?.value || semantic.getTopAction()
    ) {

      case "CANCEL_BOOKING":
        const bookingId = semantic.entities.find(
          e => e.type === EntityType.BOOKING_ID
        )?.value;

        if (!bookingId) throw new Error("Booking ID required for cancellation");

        return this.cancelBookingUseCase
          .execute(bookingId, context.identity.user.id);

      case "CREATE_BOOKING":
        const listingId = semantic.entities.find(e => e.type === EntityType.LISTING_ID)?.value;
        const checkIn = semantic.entities.find(e => e.type === "check_in")?.value;
        const checkOut = semantic.entities.find(e => e.type === "check_out")?.value;

        return this.createBookingUseCase.execute({
          listingId,
          guestId: context.identity.user.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          totalCost: 0 // To be calculated by the use case or domain
        });

      default:
        throw new Error(
          `No intent for ${semantic.getTopAction()}`
        );
    }
  }
}