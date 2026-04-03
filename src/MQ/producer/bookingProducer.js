// MQ/producer/bookingProducer.js
import { Kafka } from 'kafkajs';

// Create a new Kafka instance
const kafka = new Kafka({
  clientId: 'booking-kafka-producer',
  brokers: ['localhost:9092'],
});

// Create a producer instance
const producer = kafka.producer();

// Function to initialize the Kafka producer
const initializeProducer = async () => {
  try {
    await producer.connect();
    console.log('✅ Booking Kafka producer connected successfully!');
  } catch (error) {
    console.error('❌ Error connecting Booking Kafka producer:', error);
  }
};

// Function to send booking creation message
const sendBookingCreatedMessage = async (bookingData) => {
  try {
    const message = {
      type: 'BOOKING_CREATED',
      bookingId: bookingData.id,
      guestId: bookingData.guestId,
      listingId: bookingData.listingId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      totalPrice: bookingData.totalPrice,
      status: bookingData.status,
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: 'booking-events',
      messages: [
        { value: JSON.stringify(message) },
      ],
    });

    console.log('📤 Booking created message sent successfully:', message);
  } catch (error) {
    console.error('❌ Error sending booking created message:', error);
  }
};

// Function to send booking confirmation message
const sendBookingConfirmedMessage = async (bookingData) => {
  try {
    const message = {
      type: 'BOOKING_CONFIRMED',
      bookingId: bookingData.id,
      guestId: bookingData.guestId,
      listingId: bookingData.listingId,
      confirmedAt: bookingData.confirmedAt,
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: 'booking-events',
      messages: [
        { value: JSON.stringify(message) },
      ],
    });

    console.log('✅ Booking confirmed message sent successfully:', message);
  } catch (error) {
    console.error('❌ Error sending booking confirmed message:', error);
  }
};

// Function to send booking cancellation message
const sendBookingCancelledMessage = async (bookingData) => {
  try {
    const message = {
      type: 'BOOKING_CANCELLED',
      bookingId: bookingData.id,
      guestId: bookingData.guestId,
      listingId: bookingData.listingId,
      cancelledAt: bookingData.cancelledAt,
      reason: bookingData.cancellationReason || 'User cancelled',
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: 'booking-events',
      messages: [
        { value: JSON.stringify(message) },
      ],
    });

    console.log('❌ Booking cancelled message sent successfully:', message);
  } catch (error) {
    console.error('❌ Error sending booking cancelled message:', error);
  }
};

// Function to send booking reminder message
const sendBookingReminderMessage = async (bookingData, daysBefore) => {
  try {
    const message = {
      type: 'BOOKING_REMINDER',
      bookingId: bookingData.id,
      guestId: bookingData.guestId,
      listingId: bookingData.listingId,
      checkInDate: bookingData.checkInDate,
      daysBefore: daysBefore,
      reminderType: `${daysBefore}_DAY_REMINDER`,
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: 'booking-notifications',
      messages: [
        { value: JSON.stringify(message) },
      ],
    });

    console.log('🔔 Booking reminder message sent successfully:', message);
  } catch (error) {
    console.error('❌ Error sending booking reminder message:', error);
  }
};

// Function to send host notification message
const sendHostNotificationMessage = async (bookingData, notificationType) => {
  try {
    const message = {
      type: 'HOST_NOTIFICATION',
      notificationType: notificationType,
      bookingId: bookingData.id,
      guestId: bookingData.guestId,
      listingId: bookingData.listingId,
      hostId: bookingData.hostId,
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: 'host-notifications',
      messages: [
        { value: JSON.stringify(message) },
      ],
    });

    console.log('🏠 Host notification message sent successfully:', message);
  } catch (error) {
    console.error('❌ Error sending host notification message:', error);
  }
};

export default {
  initializeProducer,
  sendBookingCreatedMessage,
  sendBookingConfirmedMessage,
  sendBookingCancelledMessage,
  sendBookingReminderMessage,
  sendHostNotificationMessage,
};