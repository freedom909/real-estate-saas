// src/core/calendar/application/usecases/get-availability.usecase.ts

import { injectable, inject } from "tsyringe";
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";
import { CalendarAvailabilityService } from "../../domain/service/availability.service";

export interface GetAvailabilityInput {
  listingId: string;
  checkIn: string;
  checkOut: string;
}

/**
 * Query availability for a listing over a date range.
 * Pure read — no mutations.
 */
@injectable()
export class GetAvailabilityUseCase {
  constructor(
    @inject(TOKENS_CALENDAR.repos.calendarRepository)
    private repo: ICalendarRepository,
    @inject(TOKENS_CALENDAR.service.availabilityService)
    private availabilityService: CalendarAvailabilityService
  ) {}

  async execute(input: GetAvailabilityInput) {
    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error("Invalid date format");
    }

    return this.availabilityService.checkAvailability(
      this.repo,
      input.listingId,
      checkIn,
      checkOut
    );
  }
}
