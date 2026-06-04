// application/use-cases/create-booking.use-case.ts
import { injectable, inject } from "tsyringe";

import { v4 as uuidv4 } from "uuid";

import TOKENS from "@/modules/tokens/mq.tokens";
import { IBookingRepository } from "../domain/repositories/i-booking.repository";
import { RabbitMQEventBus } from "../interface/events/rabbitmq-event-bus";
import { Booking } from "../domain/entities/booking.entity";
import { DateRange } from "../domain/value-objects/date-range.vo";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";


@injectable()
export class CreateBookingUseCase {
  constructor(
    @inject(TOKENS_AI.repos.bookingRepository) private repo: IBookingRepository,
    @inject(TOKENS.eventBus) private eventBus: RabbitMQEventBus
  ) {}

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