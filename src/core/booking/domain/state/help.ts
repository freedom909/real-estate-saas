import { BookingEvent } from "./booking-event";
import { BookingState } from "./booking-state";

async function canTransition(state: BookingState, event: BookingEvent) {
  return this.next(state, event) !== state;
}