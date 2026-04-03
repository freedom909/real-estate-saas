// MQ/consumer/bookingConsumer.js
import { Kafka } from 'kafkajs';

// Create a new Kafka instance
const kafka = new Kafka({
  clientId: 'booking-kafka-consumer',
  brokers: ['localhost:9092'],
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'booking-group' });

// Function to initialize the Kafka consumer
const initializeConsumer = async () => {
  try {
    await consumer.connect();
    console.log('✅ Booking Kafka consumer connected successfully!');
    
    // Subscribe to booking topics
    await consumer.subscribe({ topic: 'booking-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'booking-notifications', fromBeginning: true });
    await consumer.subscribe({ topic: 'host-notifications', fromBeginning: true });
    
    console.log('📥 Subscribed to booking topics');
  } catch (error) {
    console.error('❌ Error connecting Booking Kafka consumer:', error);
  }
};

// Function to process booking events
const processBookingEvent = async (message) => {
  try {
    const event = JSON.parse(message.value.toString());
    console.log('📨 Received booking event:', event);
    
    switch (event.type) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(event);
        break;
      case 'BOOKING_CONFIRMED':
        await handleBookingConfirmed(event);
        break;
      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(event);
        break;
      case 'BOOKING_REMINDER':
        await handleBookingReminder(event);
        break;
      case 'HOST_NOTIFICATION':
        await handleHostNotification(event);
        break;
      default:
        console.warn('⚠️ Unknown booking event type:', event.type);
    }
  } catch (error) {
    console.error('❌ Error processing booking event:', error);
  }
};

// Handle booking created event
const handleBookingCreated = async (event) => {
  try {
    // Send email notification to guest
    await sendEmailNotification({
      to: event.guestId, // This would be guest's email in real implementation
      subject: 'Booking Confirmation - Your Booking Has Been Created',
      template: 'booking_created',
      data: {
        bookingId: event.bookingId,
        checkInDate: event.checkInDate,
        checkOutDate: event.checkOutDate,
        totalPrice: event.totalPrice,
      }
    });
    
    // Send notification to host
    await sendHostNotification({
      hostId: event.hostId,
      type: 'NEW_BOOKING',
      bookingId: event.bookingId,
      guestId: event.guestId,
    });
    
    console.log('📧 Booking created notifications sent');
  } catch (error) {
    console.error('❌ Error handling booking created event:', error);
  }
};

// Handle booking confirmed event
const handleBookingConfirmed = async (event) => {
  try {
    // Send confirmation email to guest
    await sendEmailNotification({
      to: event.guestId,
      subject: 'Booking Confirmed - Ready for Your Stay!',
      template: 'booking_confirmed',
      data: {
        bookingId: event.bookingId,
        confirmedAt: event.confirmedAt,
      }
    });
    
    console.log('✅ Booking confirmed notifications sent');
  } catch (error) {
    console.error('❌ Error handling booking confirmed event:', error);
  }
};

// Handle booking cancelled event
const handleBookingCancelled = async (event) => {
  try {
    // Send cancellation email to guest
    await sendEmailNotification({
      to: event.guestId,
      subject: 'Booking Cancellation Confirmation',
      template: 'booking_cancelled',
      data: {
        bookingId: event.bookingId,
        cancelledAt: event.cancelledAt,
        reason: event.reason,
      }
    });
    
    // Notify host about cancellation
    await sendHostNotification({
      hostId: event.hostId,
      type: 'BOOKING_CANCELLED',
      bookingId: event.bookingId,
      guestId: event.guestId,
    });
    
    console.log('❌ Booking cancelled notifications sent');
  } catch (error) {
    console.error('❌ Error handling booking cancelled event:', error);
  }
};

// Handle booking reminder event
const handleBookingReminder = async (event) => {
  try {
    // Send reminder email to guest
    await sendEmailNotification({
      to: event.guestId,
      subject: `Reminder: Your Stay Starts in ${event.daysBefore} Days`,
      template: 'booking_reminder',
      data: {
        bookingId: event.bookingId,
        checkInDate: event.checkInDate,
        daysBefore: event.daysBefore,
      }
    });
    
    console.log('🔔 Booking reminder sent');
  } catch (error) {
    console.error('❌ Error handling booking reminder event:', error);
  }
};

// Handle host notification event
const handleHostNotification = async (event) => {
  try {
    // Send notification to host (could be email, push notification, etc.)
    await sendHostNotification({
      hostId: event.hostId,
      type: event.notificationType,
      bookingId: event.bookingId,
      guestId: event.guestId,
    });
    
    console.log('🏠 Host notification sent');
  } catch (error) {
    console.error('❌ Error handling host notification event:', error);
  }
};

// Mock email notification function (would integrate with real email service)
const sendEmailNotification = async (emailData) => {
  console.log('📧 Sending email notification:', emailData);
  // In real implementation, integrate with SendGrid, Mailgun, etc.
  return Promise.resolve();
};

// Mock host notification function
const sendHostNotification = async (notificationData) => {
  console.log('🔔 Sending host notification:', notificationData);
  // In real implementation, integrate with push notification service
  return Promise.resolve();
};

// Start consuming messages
const startConsuming = async () => {
  await initializeConsumer();
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      await processBookingEvent(message);
    },
  });
};

export default {
  initializeConsumer,
  startConsuming,
  processBookingEvent,
};