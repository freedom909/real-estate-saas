// application/use-cases/create-booking.use-case.ts
import { injectable, inject } from "tsyringe";

import { v4 as uuidv4 } from "uuid";

import TOKENS from "@/modules/tokens/mq.tokens";

import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";

import { Booking } from "../../domain/entities/booking.entity";
import { DateRange } from "../../domain/value-objects/date-range.vo";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { BookingCreatedEvent } from "../../domain/events/booking-created.event";

@injectable()
export class CreateBookingUseCase {
  constructor(
    @inject(TOKENS_AI.repos.bookingRepository) private repo: IBookingRepository,
    
    @inject(TOKENS_EVENT_BUS.eventBus) private eventBus: IEventBus
  ) {}

  async execute(input: any) {
    const booking = Booking.create({
      listingId: input.listingId,
      guestId: input.guestId,
      tenantId: input.tenantId,
      dateRange: new DateRange(
        new Date(input.checkInDate),
        new Date(input.checkOutDate)
      ),
      totalCost: input.totalCost,
       
      id: uuidv4(),
    });

    await this.repo.save(booking);

    // ✅ 发布领域事件
    await this.eventBus.publish(new BookingCreatedEvent(
      booking.id,
      booking.guestId,
      input.tenantId,
      booking.listingId,
      booking.totalCost
    ));

    return booking.toJSON();
  }
}