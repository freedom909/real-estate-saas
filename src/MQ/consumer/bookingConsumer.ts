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
  "host.notification",
];

// MQ/consumer/bookingConsumer.ts


let connection: amqp.Connection;
let channel: amqp.Channel;

const QUEUE = "booking_queue";

export const initializeConsumer = async () => {
  try {
    connection = await amqp.connect("amqp://127.0.0.1:5672");

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

    switch (event.type) {
      case "BOOKING_CREATED":
        console.log("✅ Booking created");
        break;

      case "BOOKING_CANCELLED":
        console.log("❌ Booking cancelled");
        break;

      default:
        console.warn("⚠️ Unknown event:", event.type);
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
    to: event.guestId,
    subject: "Booking Created",
    template: "booking_created",
    data: event,
  });

  await sendHostNotification({
    hostId: event.hostId,
    type: "NEW_BOOKING",
    bookingId: event.bookingId,
    guestId: event.guestId,
  });

  console.log("📧 Booking created handled");
};

const handleBookingConfirmed = async (event: any) => {
  await sendEmailNotification({
    to: event.guestId,
    subject: "Booking Confirmed",
    template: "booking_confirmed",
    data: event,
  });

  console.log("✅ Booking confirmed handled");
};

const handleBookingCancelled = async (event: any) => {
  await sendEmailNotification({
    to: event.guestId,
    subject: "Booking Cancelled",
    template: "booking_cancelled",
    data: event,
  });

  await sendHostNotification({
    hostId: event.hostId,
    type: "BOOKING_CANCELLED",
    bookingId: event.bookingId,
    guestId: event.guestId,
  });

  console.log("❌ Booking cancelled handled");
};

const handleBookingReminder = async (event: any) => {
  await sendEmailNotification({
    to: event.guestId,
    subject: "Booking Reminder",
    template: "booking_reminder",
    data: event,
  });

  console.log("🔔 Reminder handled");
};

const handleHostNotification = async (event: any) => {
  await sendHostNotification({
    hostId: event.hostId,
    type: event.notificationType,
    bookingId: event.bookingId,
    guestId: event.guestId,
  });

  console.log("🏠 Host notification handled");
};



// # 🔧 mock（保持你的原逻辑）

const sendEmailNotification = async (data: any) => {
  console.log("📧 Email:", data);
};

const sendHostNotification = async (data: any) => {
  console.log("🔔 Host:", data);
};

export default {
  initializeConsumer,
  startConsuming,
};