// src/ai-platform/domain/agents/booking/booking.agent.ts

import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";

import { AgentAction, EntityType, SemanticContext} from "../../semantic/semantic-context";
import { AIContext } from "@/ai-platform/context/types/context/ai.context";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";

@injectable()
export class BookingAgent implements IDomainAgent {

  constructor(
    @inject(delay(() => CancelBookingUseCase))
    private cancelBookingUseCase:CancelBookingUseCase,

    @inject(delay(() => CreateBookingUseCase))
    private createBookingUseCase:CreateBookingUseCase,

  ) {}

  async execute(
    semantic: SemanticContext,
    context:AIContext
  ) {

    switch(semantic.action?.type) {

      case "CANCEL_BOOKING":
        let bookingId = semantic.entities.find(
          e => e.type === EntityType.BOOKING_ID
        )?.value;

        // If bookingId not found in semantic entities, try context resources
        if (!bookingId && context.resources?.bookingId) {
          bookingId = context.resources.bookingId;
        }

        if (!bookingId) throw new Error("Booking ID required for cancellation");

        // Extract reason from entities if available, otherwise use a default
        const reason = semantic.entities.find(e => (e.type as string) === "reason")?.value || "Cancelled via AI Assistant";
        return this.cancelBookingUseCase
          .execute(bookingId, reason);

      case "CREATE_BOOKING":
        let listingId = semantic.entities.find(e => e.type === EntityType.LISTING_ID)?.value;
        // If listingId not found in semantic entities, try context resources
        if (!listingId && context.resources?.listingId) {
          listingId = context.resources.listingId;
        }

        if (!listingId) throw new Error("Listing ID required for booking creation.");

        // Robust lookup for check-in and check-out entities
        const checkIn = semantic.entities.find(e => 
          ["check_in", "checkIn", "CHECK_IN", "check_in_date"].includes(e.type as string))?.value;
        const checkOut = semantic.entities.find(e => 
          ["check_out", "checkOut", "CHECK_OUT", "check_out_date"].includes(e.type as string))?.value;

        if (!checkIn) throw new Error("Check-in date required for booking creation.");
        if (!checkOut) throw new Error("Check-out date required for booking creation.");

        const priceEntity = semantic.entities.find(e => 
          ["PRICE", "price"].includes(e.type as string)
        );

        return this.createBookingUseCase.execute({
          // Ensure listingId is not undefined here
          listingId,
          guestId: context.identity.user.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          price: priceEntity ? Number(priceEntity.value) : 0,
          tenantId: (context.identity.user as any)?.tenantId || "tenant-dev",
        });

      default:
        throw new Error(
          `No intent for ${semantic.getTopAction()}`
        );
    }
  }
}