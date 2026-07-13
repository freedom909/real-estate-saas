// FILE: src/MQ/consumer/bookingConsumer.ts 

// MQ/consumer/bookingConsumer.ts

import amqp from "amqplib";

const RABBIT_URL = "amqp://localhost";
const EXCHANGE_NAME = "booking_exchange";

// routing keys（替代 Kafka topic）
const ROUTING_KEYS = [
  "booking.created",
  "booking.confirmed",
  "booking.cancelled",
  "booking.reminder",
  "owner.notification",
];

// MQ/consumer/bookingConsumer.ts
let connection: amqp.Connection;
let channel: amqp.Channel;

const QUEUE = "booking_queue";

export const initializeConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://127.0.0.1:5672");

    channel = await connection.createChannel(); // ✅ 必须有

    await channel.assertQueue(QUEUE, {
      durable: true,
    });

    console.log("✅ RabbitMQ connected & channel created");
  } catch (error) {
    console.error("❌ RabbitMQ init error:", error);
    throw error;
  }
};

// ✅ 处理消息
const processBookingEvent = async (msg: amqp.ConsumeMessage | null) => {
  if (!msg) return;

  try {
    const event = JSON.parse(msg.content.toString());

    console.log("📨 Received:", event);

    const eventType = event.type || event.eventName;

    switch (eventType) {
      case "BOOKING_CREATED":
      case "CREATED":
        console.log("✅ Booking created");
        await handleBookingCreated(event);
        break;

      case "BOOKING_CANCELLED":
      case "CANCELLED":
        console.log("❌ Booking cancelled");
        await handleBookingCancelled(event);
        break;

      case "BOOKING_CONFIRMED":

        console.log("✅ Booking confirmed");

        await handleBookingConfirmed(event);

        // await sendEmailNotification.sendEmail({
        //   to: event.customerId,
        //   subject: "Booking Confirmed",
        //   template: "booking_confirmed",
        //   data: event,
        // });

        console.log(
          "✅ Booking confirmed handled"
        );

        break;  

      default:
        console.warn("⚠️ Unknown event:", eventType);
    }

    channel.ack(msg); // ✅ 必须 ack
  } catch (error) {
    console.error("❌ Processing error:", error);
    channel.nack(msg, false, false); // ❗ 防止死循环
  }
};



// # 🚀 启动消费
export const startConsuming = async () => {
  await initializeConsumer();

  if (!channel) {
    throw new Error("❌ Channel not initialized");
  }

  await channel.consume(QUEUE, processBookingEvent);

  console.log("📥 Waiting for messages...");
};



// # =========================
// # 以下业务逻辑保持不变
// # =========================

// Handle booking created event
const handleBookingCreated = async (event: any) => {
  await sendEmailNotification({
    to: event.customerId,
    subject: "Booking Created",
    template: "booking_created",
    data: event,
  });

  await sendTenantNotification({
    tenantId: event.tenantId,
    type: "NEW_BOOKING",
    bookingId: event.bookingId,
    customerId: event.customerId,
  });

  console.log("📧 Booking created handled");
};

const handleBookingConfirmed = async (event: any) => {
  await sendEmailNotification({
    to: event.customerId,
    subject: "Booking Confirmed",
    template: "booking_confirmed",
    data: event,
  });

  console.log("✅ Booking confirmed handled");
};

const handleBookingCancelled = async (event: any) => {
  await sendEmailNotification({
    to: event.customerId,
    subject: "Booking Cancelled",
    template: "booking_cancelled",
    data: event,
  });

  await sendTenantNotification({
    tenantId: event.tenantId,
    type: "BOOKING_CANCELLED",
    bookingId: event.bookingId,
    customerId: event.customerId,
  });

  console.log("❌ Booking cancelled handled");
};

const handleBookingReminder = async (event: any) => {
  await sendEmailNotification({
    to: event.customerId,
    subject: "Booking Reminder",
    template: "booking_reminder",
    data: event,
  });

  console.log("🔔 Reminder handled");
};

const handleTenantNotification = async (event: any) => {
  await sendTenantNotification({
    tenantId: event.tenantId,
    type: event.notificationType,
    bookingId: event.bookingId,
    customerId: event.customerId,
  });

  console.log("🏠 Tenant notification handled");
};



// # 🔧 mock（保持你的原逻辑）

const sendEmailNotification = async (data: any) => {
  console.log("📧 Email:", data);
};

const sendTenantNotification = async (data: any) => {
  console.log("🔔 Tenant:", data);
};

export default {
  initializeConsumer,
  startConsuming,
};