// src/core/calendar/application/usecases/reserve-slot.usecase.ts


import { injectable, inject } from "tsyringe";
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";
import { parseDateOnly } from "@/infrastructure/utils/parseDateOnly";

export interface ReserveSlotInput {
  listingId: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
}

@injectable()
export class ReserveSlotUseCase {
  constructor(
    @inject(TOKENS_CALENDAR.repos.calendarRepository)
    private repo: ICalendarRepository
  ) {}

  async execute(input: ReserveSlotInput) {
    if (!input.listingId || !input.bookingId) {
      throw new Error("listingId and bookingId are required");
    }

    const checkIn = parseDateOnly(input.checkIn);
    const checkOut = parseDateOnly(input.checkOut);

    if (checkIn >= checkOut) {
      throw new Error("Invalid reservation date range");
    }

    const reserved = await this.repo.reserveRange(
      input.listingId,
      input.bookingId,
      checkIn,
      checkOut
    );

    return {
      reserved,
      listingId: input.listingId,
      bookingId: input.bookingId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    };
  }
}
