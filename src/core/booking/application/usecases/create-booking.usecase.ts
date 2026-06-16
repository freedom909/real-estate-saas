// application/usecases/create-booking.usecase.ts
import { injectable, inject } from "tsyringe";

import { v4 as uuidv4 } from "uuid";

import TOKENS from "@/modules/tokens/mq.tokens";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { Booking } from "@/core/booking/domain/entities/booking.entity";
import { DateRange } from "@/core/booking/domain/value-objects/date-range.vo";
import { BookingCreatedEvent } from "@/core/booking/domain/events/booking-created.event";
import { BookingStatus } from "../../domain/value-objects/booking-status";
import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";

@injectable()
export class CreateBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository) private repo: IBookingRepository,
    
    @inject(TOKENS_EVENT_BUS.eventBus) private eventBus: IEventBus
  ) {}

  async execute(input: any) {
    // Validate input to ensure all required fields are present
    const required = ['listingId', 'guestId', 'tenantId', 'checkInDate', 'checkOutDate'];
    const missing = required.filter(field => !input[field]);
    if (input.price === undefined) missing.push('price');

    if (missing.length > 0) {
      console.error("Validation failed for CreateBookingUseCase. Input received:", JSON.stringify(input, null, 2));
      throw new Error(`Missing required booking information: ${missing.join(', ')}`);
    }

    const price = input.price !== undefined && input.price !== null ? Number(input.price) : 0; 

    const booking = Booking.create({
      listingId: input.listingId,
      guestId: input.guestId,
      tenantId: input.tenantId ?? "tenant-dev",
      dateRange: new DateRange(
        new Date(input.checkInDate),
        new Date(input.checkOutDate)
      ),
      price: price,
      id: uuidv4(),
      // status and createdAt are set internally by Booking.create
      
      lifecycleStatus: BookingLifecycleStatus.UPCOMING,
      cancelReason: null
      
    });

    await this.repo.save(booking);

    // ✅ 发布领域事件
    await this.eventBus.publish(new BookingCreatedEvent(
      booking.id,
      booking.guestId,
      booking.tenantId, // Use the tenantId from the created booking entity
      booking.listingId,
      booking.price,
      booking.dateRange.checkInDate,
      booking.dateRange.checkOutDate
    ));

    return booking.toJSON();
  }
}