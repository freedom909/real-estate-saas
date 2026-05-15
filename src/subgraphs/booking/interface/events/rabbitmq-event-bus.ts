//src/subgraphs/booking/interface/events/rabbitmq-event-bus

import { injectable } from "tsyringe";

import * as amqp from "amqplib";
import type { Connection, Channel } from "amqplib";

@injectable()
export class RabbitMQEventBus {
  private connection!: Connection;
  private channel!: Channel;

  private readonly QUEUE = "booking_queue";

  async init(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
      try {
        let rabbitMqUrl =
          process.env.RABBITMQ_URL?.trim() ||
          "amqp://127.0.0.1:5672";

        if (!rabbitMqUrl.startsWith("amqp://") && !rabbitMqUrl.startsWith("amqps://")) {
          rabbitMqUrl = `amqp://${rabbitMqUrl}`;
        }

        console.log(
          `⏳ Initializing RabbitMQ EventBus (Attempt ${i + 1}/${retries})...`,
          rabbitMqUrl
        );

        this.connection = await amqp.connect(rabbitMqUrl);

        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(this.QUEUE, {
          durable: true,
        });

        console.log("✅ RabbitMQ EventBus initialized");
        return;
      } catch (err: any) {
        if (i === retries - 1) {
          console.error("❌ RabbitMQ init error after maximum retries:", err.message);
          throw err;
        }
        console.warn(`⚠️ RabbitMQ connection attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  async publish(event: any) {
    if (!this.channel) {
      throw new Error("❌ EventBus not initialized");
    }

    this.channel.sendToQueue(
      this.QUEUE,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
      }
    );

    console.log("📢 Event published:", event);
  }
}