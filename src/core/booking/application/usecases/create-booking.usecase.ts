//src/core/booking/application/usecases/create-booking.usecase.ts


import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";

import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { Booking } from "@/core/booking/domain/entities/booking.entity";
import { DateRange } from "@/core/booking/domain/value-objects/date-range.vo";
import { BookingCreatedEvent } from "@/core/booking/domain/events/booking-created.event";

import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";
import { BookingPricingService } from "../../domain/service/booking-pricing.service";
import { InMemoryEventBus } from "@/shared/eventbus/in-memory-event-bus";
import { IListingGateway } from "../../domain/gateways/i-listing.gateway";

import { CalendarClient } from "../adapter/calendar";
import { CreateBookingInput } from "frontend/app/types/booking.types";
import { generateReservationNumber } from "../reservation.number";

export interface BookingActor {
  customerId: string;
  tenantId?: string | null;
}

@injectable()
export class CreateBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private repo: IBookingRepository,

    @inject(TOKENS_EVENT_BUS.eventBus)
    private eventBus: InMemoryEventBus,

    @inject(TOKENS_BOOKING.gateway.listingGateway)
    private listingGateway: IListingGateway,

    @inject(TOKENS_BOOKING.acl.calendarClient)
    private calendarClient: CalendarClient,
  ) {}

  async execute(input: CreateBookingInput, actor: BookingActor) {

    // 1. Validate input
    const missingInput: string[] = [];

    if (!input.listingId) missingInput.push("listingId");
    if (!input.checkInDate) missingInput.push("checkInDate");
    if (!input.checkOutDate) missingInput.push("checkOutDate");

    if (missingInput.length > 0) {
      throw new Error(
        `Missing required booking information: ${missingInput.join(", ")}`
      );
    }

    if (!actor?.customerId) {
      throw new Error("Missing required authentication: customerId");
    }

    const checkIn = new Date(input.checkInDate);
    const checkOut = new Date(input.checkOutDate);

    if (isNaN(checkIn.getTime())) {
      throw new Error("Invalid checkInDate");
    }

    if (isNaN(checkOut.getTime())) {
      throw new Error("Invalid checkOutDate");
    }

    if (checkIn >= checkOut) {
      throw new Error("checkInDate must be before checkOutDate");
    }

    // 2. Generate booking ID
    const bookingId = uuidv4();

    // Track reservation and database save state
    let calendarReserved = false;
    let bookingSaved = false;

    try {
      // 3. Reserve calendar dates
      await this.calendarClient.reserveSlot({
        listingId: input.listingId,
        bookingId,
        checkIn: input.checkInDate,
        checkOut: input.checkOutDate,
      });

      calendarReserved = true;

      // 4. Get listing price
      const nightlyPrice =
        await this.listingGateway.getListingPrice(input.listingId);

      const price = BookingPricingService.calculatePrice(
        nightlyPrice,
        checkIn,
        checkOut
      );

      // 5. Get listing tenant
      const listingTenantId =
        await this.listingGateway.getListingTenantId(input.listingId);

      // 6. Create Booking entity
      const reservationNumber = generateReservationNumber();

      const booking = Booking.create({
        id: bookingId,
        listingId: input.listingId,
        reservationNumber,
        customerId: actor.customerId,
        tenantId: listingTenantId || actor.tenantId || actor.customerId,
        dateRange: new DateRange(checkIn, checkOut),
        price,
        lifecycleStatus: BookingLifecycleStatus.UPCOMING,
        cancelReason: null,
      });

      // 7. Save Booking
      await this.repo.save(booking);

      bookingSaved = true;

      // 8. Publish event
      // Event failure must NOT release an already saved booking.
      try {
        await this.eventBus.publish(
          new BookingCreatedEvent(
            booking.id,
            booking.customerId,
            booking.tenantId,
            booking.listingId,
            booking.price,
            booking.dateRange.checkInDate,
            booking.dateRange.checkOutDate
          )
        );
      } catch (eventError) {
        console.error(
          "Booking saved, but event publishing failed:",
          eventError
        );
      }

      return booking.toJSON();

    } catch (error) {

      // 9. Release calendar only if booking was not saved
      if (calendarReserved && !bookingSaved) {
        try {
          await this.calendarClient.releaseSlot({
  bookingId,
  reason: "Booking creation failed",
          });
        } catch (releaseError) {
          console.error(
            "CRITICAL: Failed to release calendar reservation",
            releaseError
          );
        }
      }

      throw error;
    }
  }
}
