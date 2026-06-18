// FILE: src/MQ/consumer/paymentConsumer.ts 

// MQ/consumer/paymentConsumer.ts

import amqp from "amqplib";

const RABBIT_URL = "amqp://localhost";
const EXCHANGE_NAME = "payment_exchange";

// routing keys（替代 Kafka topic）
const ROUTING_KEYS = [
  "payment.created",
  "payment.pend",
  "payment.cancelled",
  "payment.fail",
  "payment.refund",
  "host.notification",
];

// MQ/consumer/PaymentConsumer.ts
let connection: amqp.Connection;
let channel: amqp.Channel;

const QUEUE = "payment_queue";

export const initializeConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://127.0.0.1:5673");

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
const processPaymentEvent = async (msg: amqp.ConsumeMessage | null) => {
  if (!msg) return;

  try {
    const event = JSON.parse(msg.content.toString());

    console.log("📨 Received:", event);

    const eventType = event.type || event.eventName;

    switch (eventType) {
      
      case "PAYMENT_CREATED":
      case "CREATED":
        console.log("✅ payment created");
        await handlePaymentCreated(event);
        break;

      case "PAYMENT_CANCELLED":
      case "CANCELLED":
        console.log("❌ payment cancelled");
        await handlePaymentCancelled(event);
        break;

      case "PAYMENT_SUCCEEDED":
      case "SUCCEEDED":

        console.log("✅ payment succeeded");

        await handlePaymentSucceeded(event);

        // await sendEmailNotification.sendEmail({
        //   to: event.guestId,
        //   subject: "Payment Confirmed",
        //   template: "Payment_confirmed",
        //   data: event,
        // });

        console.log(
          "✅ Payment succeeded handled"
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

  await channel.consume(QUEUE, processPaymentEvent);

  console.log("📥 Waiting for messages...");
};



// # =========================
// # 以下业务逻辑保持不变
// # =========================

// Handle Payment created event
const handlePaymentCreated = async (event: any) => {
  await sendEmailNotification({
    to: event.guestId,
    subject: "Payment Created",
    template: "Payment_created",
    data: event,
  });

  await sendHostNotification({
    hostId: event.hostId,
    type: "NEW_Payment",
    PaymentId: event.PaymentId,
    guestId: event.guestId,
  });

  console.log("📧 Payment created handled");
};

const handlePaymentSucceeded = async (event: any) => {
  await sendEmailNotification({
    to: event.guestId,
    subject: "Payment Succeeded",
    template: "Payment_succeeded",
    data: event,
  });

  console.log("✅ Payment succeeded handled");
};

const handlePaymentCancelled = async (event: any) => {
  await sendEmailNotification({
    to: event.guestId,
    subject: "Payment Cancelled",
    template: "Payment_cancelled",
    data: event,
  });

  await sendHostNotification({
    hostId: event.hostId,
    type: "Payment_CANCELLED",
    PaymentId: event.PaymentId,
    guestId: event.guestId,
  });

  console.log("❌ Payment cancelled handled");
};

const handlePaymentReminder = async (event: any) => {
  await sendEmailNotification({
    to: event.guestId,
    subject: "Payment Reminder",
    template: "Payment_reminder",
    data: event,
  });

  console.log("🔔 Reminder handled");
};

const handleHostNotification = async (event: any) => {
  await sendHostNotification({
    hostId: event.hostId,
    type: event.notificationType,
    PaymentId: event.PaymentId,
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