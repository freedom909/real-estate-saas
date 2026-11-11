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
import { generateReservationNumber } from "../reservation.number";
import { parseDateOnly } from "@/infrastructure/utils/parseDateOnly";

export interface BookingActor {
  customerId: string;
}

export interface CreateBookingInput {
  listingId: string;
  checkInDate: string;
  checkOutDate: string;
  guests?: number;
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
  ) { }

  async execute(input: CreateBookingInput, actor: BookingActor) {
    // 1. Validate required input
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

    // 2. Parse and validate dates
    const checkIn = parseDateOnly(input.checkInDate);
    const checkOut = parseDateOnly(input.checkOutDate);

    // DateRange itself validates that checkOut is after checkIn.
    const dateRange = new DateRange(checkIn, checkOut);

    // 3. Get trusted listing information from Listing service
    const listing = await this.listingGateway.getBookableListing(
      input.listingId
    );

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (!listing.tenantId) {
      throw new Error("Listing has no tenant");
    }

    if (!listing.isActive) {
      throw new Error("Listing is not available for booking");
    }

    if (
      !Number.isFinite(listing.nightlyPrice) ||
      listing.nightlyPrice < 0
    ) {
      throw new Error("Invalid listing price");
    }

    // Tenant ownership must come from the Listing, never from the customer.
    const tenantId = listing.tenantId;

    // 4. Calculate price on the server
    const price = BookingPricingService.calculatePrice(
      listing.nightlyPrice,
      dateRange
    );

    // 5. Generate booking ID
    const bookingId = uuidv4();

    let calendarReserved = false;
    let bookingSaved = false;

    try {
      // 6. Reserve calendar dates
      await this.calendarClient.reserveSlot({
        listingId: input.listingId,
        bookingId,
        checkIn: input.checkInDate,
        checkOut: input.checkOutDate,
      });

      // Set this only AFTER reserveSlot succeeds.
      calendarReserved = true;

      // 7. Create Booking entity
      const reservationNumber = generateReservationNumber();

      const booking = Booking.create({
        id: bookingId,
        listingId: input.listingId,
        reservationNumber,
        customerId: actor.customerId,
        tenantId,
        dateRange,
        price,
        lifecycleStatus: BookingLifecycleStatus.UPCOMING,
        cancelReason: null,
      });

      // 8. Save Booking
      await this.repo.save(booking);
      bookingSaved = true;

      // 9. Publish event
      // If publishing fails, keep the saved booking.
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
      // Release calendar only if reservation succeeded but booking was not saved.
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
