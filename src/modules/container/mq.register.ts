import { container } from "tsyringe";
import TOKENS from "@/modules/tokens/mq.tokens";
import { RabbitMQEventBus } from "@/subgraphs/booking/interface/events/rabbitmq-event-bus";

export default function registerMQEventBus() {
  container.registerSingleton(TOKENS.eventBus, RabbitMQEventBus);
}