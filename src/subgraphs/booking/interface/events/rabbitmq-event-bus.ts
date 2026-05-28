// infrastructure/events/rabbitmq-event-bus.ts
import { injectable } from "tsyringe";

import amqp, { Connection, Channel } from "amqplib";

@injectable()
export class RabbitMQEventBus {
  private connection!: Connection;
  private channel!: Channel;
  private readonly QUEUE = "booking_queue";

  async init() {
    try {
      this.connection = await amqp.connect("amqp://127.0.0.1:5672");

      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.QUEUE, {
        durable: true,
      });

      console.log("✅ RabbitMQ EventBus initialized");
    } catch (err) {
      console.error("❌ RabbitMQ init error:", err);
      throw err;
    }
  }


  async publish(event: any) {
    if (!this.channel) {
      throw new Error("❌ EventBus not initialized");
    }

    this.channel.sendToQueue(
      "booking_queue",
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );
    console.log("📢 Event published:", event);
  }
}