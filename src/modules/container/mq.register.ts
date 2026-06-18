import { container } from "tsyringe";
import TOKENS from "@/modules/tokens/mq.tokens";
import { BookingMQEventBus } from "@/core/booking/interface/events/booking-event-bus";

export default function registerMQEventBus() {
  container.registerSingleton(TOKENS.eventBus, BookingMQEventBus);
}