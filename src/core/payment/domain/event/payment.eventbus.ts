//src/subgraphs/booking/interface/events/rabbitmq-event-bus.ts
import { injectable } from "tsyringe";
import * as amqp from "amqplib";


@injectable()
export class PaymentMQEventBus {
  
private connection!: amqp.ChannelModel;
 private channel!: amqp.Channel;
  private readonly QUEUE = "payment_queue";

  async init() {
    try {
     this.connection = await amqp.connect(
      process.env.RABBITMQ_URL!
     );//

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
      "payment_queue",
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );
    console.log("📢 Event published:", event);
  }
}