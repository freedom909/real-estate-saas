import { injectable } from "tsyringe";
import { AIContext } from "../contracts/ai-context";

@injectable()
export class BookingDraftUpdater {

  initialize(
    context: AIContext,
    listingId: string
  ) {

    context.resources.bookingDraft = {
      listingId
    };
  }

  updateDates(
    context: AIContext,
    checkInDate: string,
    checkOutDate: string
  ) {

    context.resources.bookingDraft = {
      ...context.resources.bookingDraft,
      checkInDate,
      checkOutDate
    };
  }

  updateGuests(
    context: AIContext,
    guestCount: number
  ) {

    context.resources.bookingDraft = {
      ...context.resources.bookingDraft,
      guestCount
    };
  }

  clear(
    context: AIContext
  ) {

    delete context.resources.bookingDraft;
  }
}