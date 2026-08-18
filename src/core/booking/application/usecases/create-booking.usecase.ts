// application/usecases/create-booking.usecase.ts


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

// ── Calendar Integration ──

import { CalendarClient } from "../adapter/calendar";
import { CreateBookingInput } from "frontend/app/types/booking.types";
import { generateReservationNumber} from "../reservation.number";

interface BookingActor {
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
    // ── Calendar: reserve slots on booking creation ──
    @inject(TOKENS_BOOKING.acl.calendarClient)
    private calendarClient: CalendarClient,
  ) {}

async execute(input: CreateBookingInput, actor: BookingActor) {
  // 1. Validate — dates + listing come from input; customerId/tenantId from actor
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

  // 2. Generate ONE booking ID
  const bookingId = uuidv4();

  // 3. Reserve Calendar
  await this.calendarClient.reserveSlot({
    listingId: input.listingId,
    bookingId,
    checkIn: input.checkInDate,
    checkOut: input.checkOutDate,
  });

  try {
    // 4. Get price
    const nightlyPrice =
      await this.listingGateway.getListingPrice(input.listingId);

    const price =BookingPricingService.calculatePrice(
        nightlyPrice,
        checkIn,
        checkOut
      );

    // 5. Create Booking
    const reservationNumber = generateReservationNumber();
    const booking = Booking.create({
      id: bookingId,
      listingId: input.listingId,
      reservationNumber: reservationNumber,
      customerId: actor.customerId,
      tenantId: actor.tenantId || actor.customerId,
      
      dateRange: new DateRange(
        checkIn,
        checkOut
      ),
      price,
      lifecycleStatus:
        BookingLifecycleStatus.UPCOMING,
      cancelReason: null,
    });

    // 6. Save
    await this.repo.save(booking);

    // 7. Event
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

    return booking.toJSON();

  } catch (error) {
    // Booking creation failed after Calendar reservation.
    // Release the reservation.
    try {
      await this.calendarClient.releaseSlot({
        listingId: input.listingId,
        bookingId,
        checkIn: input.checkInDate,
        checkOut: input.checkOutDate,
      });
    } catch (releaseError) {
      console.error(
        "CRITICAL: Failed to release calendar reservation",
        releaseError
      );
    }

    throw error;
  }
}
}
