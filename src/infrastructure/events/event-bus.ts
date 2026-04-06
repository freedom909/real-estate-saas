// infrastructure/events/event-bus.ts

import { injectable } from "tsyringe";

@injectable()
export class EventBus {
  async publish(event: any) {
    console.log("📢 Event published:", event);

    // 👉 这里可以接 RabbitMQ / Kafka
  }
}