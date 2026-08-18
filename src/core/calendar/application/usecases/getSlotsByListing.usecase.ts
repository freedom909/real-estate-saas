//src/core/calendar/application/usecases/getSlotsByListing.usecase.ts

import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetSlotsByListingUseCase {
  constructor(
    @inject(TOKENS_CALENDAR.repos.calendarRepository)
    private calendarRepository: ICalendarRepository,
  ) {}
  
  async execute(listingId: string) {
    return this.calendarRepository.getSlotsByListing(listingId);
  }
}