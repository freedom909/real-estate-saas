import { container } from "tsyringe";

import { RabbitMQEventBus } from "../../subgraphs/booking/interface/events/rabbitmq-event-bus.js";
import { TOKENS_EVENT } from "../tokens/event.tokens.js";

export default function registerMQEventBus() {
  container.registerSingleton(TOKENS_EVENT.eventBus, RabbitMQEventBus);
}