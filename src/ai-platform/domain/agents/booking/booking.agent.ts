// src/ai-platform/domain/agents/booking/booking.agent.ts

import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";

import { SemanticContext, SemanticIntent } from "../../semantic/semantic-context";

import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { UserContext } from "../../semantic/types/userContext";
import { CancelBookingUseCase } from "@/subgraphs/booking/application/use-cases/cancel-booking.use-case";
import { CreateBookingUseCase } from "@/subgraphs/booking/application/use-cases/create-booking.use-case";
import { AIContext } from "../../types/context/aiContext";

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
      semantic.getTopIntent()
    ) {

      case "CANCEL_BOOKING":
        const bookingId = semantic.entities.find(
          e => e.type === "booking_id"
        )?.value;

        if (!bookingId) throw new Error("Booking ID required for cancellation");

        return this.cancelBookingUseCase
          .execute(bookingId, context.userId);

      case "CREATE_BOOKING":
        const listingId = semantic.entities.find(e => e.type === "listing_id")?.value;
        const checkIn = semantic.entities.find(e => e.type === "check_in")?.value;
        const checkOut = semantic.entities.find(e => e.type === "check_out")?.value;

        return this.createBookingUseCase.execute({
          listingId,
          guestId: context.userId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          totalCost: 0 // To be calculated by the use case or domain
        });

      default:
        throw new Error(
          `No intent for ${semantic.getTopIntent()}`
        );
    }
  }
}