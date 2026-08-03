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

@injectable()
export class CreateBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository) 
    private repo: IBookingRepository, 
    @inject(TOKENS_EVENT_BUS.eventBus) 
    private eventBus: InMemoryEventBus,
    @inject(TOKENS_BOOKING.gateway.listingGateway)
    private listingGateway: IListingGateway
  ) {}

  async execute(input: any) {
    // Validate input to ensure all required fields are present
    
const required = [
  "listingId",
  "customerId",
  "checkInDate",
  "checkOutDate"
];

const missing =
  required.filter(field => !input[field]);

if (missing.length > 0) {
  throw new Error(
    `Missing required booking information: ${missing.join(", ")}`
  );
}

const checkIn =
  new Date(input.checkInDate);

const checkOut =
  new Date(input.checkOutDate);

if (isNaN(checkIn.getTime())) {
  throw new Error(
    "Invalid checkInDate"
  );
}

if (isNaN(checkOut.getTime())) {
  throw new Error(
    "Invalid checkOutDate"
  );
}

if (checkIn.getTime() >= checkOut.getTime()) {
  throw new Error(
    "checkInDate must be before checkOutDate"
  );
}

const nightlyPrice = await this.listingGateway.getListingPrice(input.listingId);
const price = BookingPricingService.calculatePrice(nightlyPrice, checkIn, checkOut);
const booking =
  Booking.create({
    id: uuidv4(),
    listingId: input.listingId,
    customerId: input.customerId,
    tenantId: input.tenantId ?? "tenant-dev",
    dateRange: new DateRange(
      new Date(input.checkInDate),
      new Date(input.checkOutDate)
    ),
    price,
    lifecycleStatus:
      BookingLifecycleStatus.UPCOMING,
    cancelReason: null
  });

    await this.repo.save(booking);

    // ✅ 发布领域事件
    await this.eventBus.publish(new BookingCreatedEvent(
      booking.id,
      booking.customerId,
      booking.tenantId, // Use the tenantId from the created booking entity
      booking.listingId,
      booking.price,
      booking.dateRange.checkInDate,
      booking.dateRange.checkOutDate
    ));

    return booking.toJSON();
  }
}