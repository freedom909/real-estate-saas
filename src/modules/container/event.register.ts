//src/modules/container/event.register.ts

import { container } from "tsyringe";

import { RabbitMQEventBus } from "@/subgraphs/booking/interface/events/rabbitmq-event-bus.js";
import { TOKENS_EVENT } from "../tokens/event.tokens.js";

const registerMQEventBus = () => {
  container.register(TOKENS_EVENT.eventBus, {
    useClass: RabbitMQEventBus,
  });
};

export default registerMQEventBus;