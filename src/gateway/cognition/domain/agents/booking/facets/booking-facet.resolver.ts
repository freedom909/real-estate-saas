// src/gateway/cognition/domain/agents/booking/facets/booking-facet.resolver.ts
import { injectable } from "tsyringe";
import { IExecutor, IFacetResolver } from "../../../planning/types/i-facet.resolver";
import { CancelBookingExecutor } from "../../../semantic/extractors/cancel-booking.executor";
import { CapabilityType } from "../../../planning/types/enums";


@injectable()
export class BookingFacetResolver implements IFacetResolver {
  constructor(
    private cancelBookingExecutor: CancelBookingExecutor
  ) {}

  resolve(capability: CapabilityType): IExecutor {
    switch (capability) {
      case CapabilityType.CANCEL_BOOKING: return this.cancelBookingExecutor;
      default: throw new Error(`No executor found for Booking capability: ${capability}`);
    }
  }
}