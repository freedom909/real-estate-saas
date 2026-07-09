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

  updateCustomers(
    context: AIContext,
    customerCount: number
  ) {

    context.resources.bookingDraft = {
      ...context.resources.bookingDraft,
      customerCount
    };
  }

  clear(
    context: AIContext
  ) {

    delete context.resources.bookingDraft;
  }
}