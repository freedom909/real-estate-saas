//src/core/payment/domain/event/payment.eventbus.ts

import * as amqp from "amqplib";
import { injectable } from "tsyringe";

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

    } catch (err) {
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
  }
}