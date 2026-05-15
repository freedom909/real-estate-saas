// application/use-cases/create-booking.use-case.ts
import { injectable, inject } from "tsyringe";

import { v4 as uuidv4 } from "uuid";

import { TOKENS_EVENT } from "@/modules/tokens/event.tokens.js";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository.js";
import { RabbitMQEventBus } from "../../interface/events/rabbitmq-event-bus.js";
import { Booking } from "../../domain/entities/booking.entity.js";
import { DateRange } from "../../domain/value-objects/date-range.vo.js";

@injectable()
export class CreateBookingUseCase {
  constructor(
    @inject("BookingRepository") private repo: IBookingRepository,
    @inject(TOKENS_EVENT.eventBus) private eventBus: RabbitMQEventBus
  ) { }

  async execute(input: any) {
    const booking = Booking.create({
      listingId: input.listingId,
      guestId: input.guestId,
      dateRange: new DateRange(
        new Date(input.checkInDate),
        new Date(input.checkOutDate)
      ),
      totalCost: input.totalCost,
       
      id: uuidv4(),
    });

    await this.repo.save(booking);

    // ✅ 发布领域事件
    await this.eventBus.publish({
      type: "BOOKING_CREATED",
      bookingId: booking.id,
      guestId: booking.guestId,
    });

    return booking.toJSON();
  }
}