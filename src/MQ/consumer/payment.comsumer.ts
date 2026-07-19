// FILE: src/MQ/consumer/paymentConsumer.ts 

// MQ/consumer/paymentConsumer.ts


import { CreatePaymentUseCase } from "@/core/payment/application/usecase/create-payment.usecase";
import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import amqp from "amqplib";
import { container } from "tsyringe";

const RABBIT_URL = "amqp://localhost";
const EXCHANGE_NAME = "payment_exchange";

type BookingCreatedEvent = {

type: "BookingCreated";

payload: {

bookingId: string;

tenantId: string;

customerId: string;

amount: number;

};

};

// routing keys（替代 Kafka topic）
const ROUTING_KEYS = [
  "payment.created",
  "payment.pend",
  "payment.cancelled",
  "payment.fail",
  "payment.refund",
  "owner.notification",
];

// MQ/consumer/PaymentConsumer.ts
let connection: amqp.Connection;
let channel: amqp.Channel;

const QUEUE = "booking_queue";

export const initializeConsumer = async () => {
  try {

    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
   
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

const rawEvent = JSON.parse(msg.content.toString());

console.log("📨 Received:", rawEvent);

const eventType = rawEvent.type || rawEvent.eventName;

switch (eventType) {

case "BOOKING_CREATED":
case "BookingCreated":

await handleBookingCreated(rawEvent as BookingCreatedEvent);

break;

case "PAYMENT_CREATED":

await handlePaymentCreated(rawEvent);

break;

case "PAYMENT_SUCCEEDED":

await handlePaymentSucceeded(rawEvent);

break;

case "PAYMENT_CANCELLED":

await handlePaymentCancelled(rawEvent);

break;

case "PAYMENT_REMINDER":

await handlePaymentReminder(rawEvent);

break;

}

channel.ack(msg);

} catch (error) {

console.error("❌ Processing error:", error);

channel.nack(msg, false, false);

}

}

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
    to: event.customerId,
    subject: "Payment Created",
    template: "Payment_created",
    data: event,
  });

  await sendTenantNotification({
    tenantId: event.tenantId,
    type: "NEW_Payment",
    PaymentId: event.PaymentId,
    customerId: event.customerId,
  });

  console.log("📧 Payment created handled");
};

const handlePaymentSucceeded = async (event: any) => {
  await sendEmailNotification({
    to: event.customerId,
    subject: "Payment Succeeded",
    template: "Payment_succeeded",
    data: event,
  });

  console.log("✅ Payment succeeded handled");
};

const handlePaymentCancelled = async (event: any) => {
  await sendEmailNotification({
    to: event.customerId,
    subject: "Payment Cancelled",
    template: "Payment_cancelled",
    data: event,
  });

  await sendTenantNotification({
    tenantId: event.tenantId,
    type: "Payment_CANCELLED",
    PaymentId: event.PaymentId,
    customerId: event.customerId,
  });

  console.log("❌ Payment cancelled handled");
};

const handlePaymentReminder = async (event: any) => {
  await sendEmailNotification({
    to: event.customerId,
    subject: "Payment Reminder",
    template: "Payment_reminder",
    data: event,
  });

  console.log("🔔 Reminder handled");
};

const handleTenantNotification = async (event: any) => {
  await sendTenantNotification({
    tenantId: event.tenantId,
    type: event.notificationType,
    PaymentId: event.PaymentId,
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

async function handleBookingCreated(event: any) {
  console.log("✅ booking created", event);
  const UseCase = container.resolve<CreatePaymentUseCase>(TOKENS_PAYMENT.usecase.createPaymentUseCase);
  await UseCase.execute({
    bookingId: event.bookingId,
    customerId: event.customerId,
    tenantId: event.tenantId,
    amount: event.price,
  });
}
