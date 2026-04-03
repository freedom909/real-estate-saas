// services/bookingMQService.js
import bookingProducer from '../MQ/producer/bookingProducer.js';

class BookingMQService {
  constructor() {
    this.producer = bookingProducer;
    this.initialized = false;
  }

  // Initialize the MQ service
  async initialize() {
    if (!this.initialized) {
      await this.producer.initializeProducer();
      this.initialized = true;
      console.log('✅ Booking MQ Service initialized');
    }
  }

  // Send booking created notification
  async notifyBookingCreated(bookingData) {
    try {
      await this.initialize();
      await this.producer.sendBookingCreatedMessage(bookingData);
      
      // Also send host notification
      await this.producer.sendHostNotificationMessage(
        bookingData, 
        'NEW_BOOKING'
      );
      
      console.log('📤 Booking creation notifications sent');
    } catch (error) {
      console.error('❌ Error sending booking created notification:', error);
    }
  }

  // Send booking confirmed notification
  async notifyBookingConfirmed(bookingData) {
    try {
      await this.initialize();
      await this.producer.sendBookingConfirmedMessage(bookingData);
      
      // Send host notification
      await this.producer.sendHostNotificationMessage(
        bookingData, 
        'BOOKING_CONFIRMED'
      );
      
      console.log('✅ Booking confirmation notifications sent');
    } catch (error) {
      console.error('❌ Error sending booking confirmed notification:', error);
    }
  }

  // Send booking cancelled notification
  async notifyBookingCancelled(bookingData, cancellationReason = 'User cancelled') {
    try {
      await this.initialize();
      
      const bookingWithReason = {
        ...bookingData,
        cancellationReason
      };
      
      await this.producer.sendBookingCancelledMessage(bookingWithReason);
      
      // Send host notification
      await this.producer.sendHostNotificationMessage(
        bookingData, 
        'BOOKING_CANCELLED'
      );
      
      console.log('❌ Booking cancellation notifications sent');
    } catch (error) {
      console.error('❌ Error sending booking cancelled notification:', error);
    }
  }

  // Send booking reminder
  async sendBookingReminder(bookingData, daysBefore) {
    try {
      await this.initialize();
      await this.producer.sendBookingReminderMessage(bookingData, daysBefore);
      console.log(`🔔 ${daysBefore}-day booking reminder sent`);
    } catch (error) {
      console.error('❌ Error sending booking reminder:', error);
    }
  }

  // Send custom host notification
  async sendCustomHostNotification(bookingData, notificationType, customData = {}) {
    try {
      await this.initialize();
      
      const notificationData = {
        ...bookingData,
        ...customData
      };
      
      await this.producer.sendHostNotificationMessage(
        notificationData, 
        notificationType
      );
      
      console.log(`🏠 Custom host notification sent: ${notificationType}`);
    } catch (error) {
      console.error('❌ Error sending custom host notification:', error);
    }
  }

  // Schedule booking reminders
  async scheduleBookingReminders(bookingData) {
    try {
      const checkInDate = new Date(bookingData.checkInDate);
      const now = new Date();
      const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));
      
      // Schedule reminders based on days until check-in
      if (daysUntilCheckIn >= 7) {
        // Schedule 7-day reminder
        setTimeout(() => {
          this.sendBookingReminder(bookingData, 7);
        }, (daysUntilCheckIn - 7) * 24 * 60 * 60 * 1000);
      }
      
      if (daysUntilCheckIn >= 3) {
        // Schedule 3-day reminder
        setTimeout(() => {
          this.sendBookingReminder(bookingData, 3);
        }, (daysUntilCheckIn - 3) * 24 * 60 * 60 * 1000);
      }
      
      if (daysUntilCheckIn >= 1) {
        // Schedule 1-day reminder
        setTimeout(() => {
          this.sendBookingReminder(bookingData, 1);
        }, (daysUntilCheckIn - 1) * 24 * 60 * 60 * 1000);
      }
      
      console.log('⏰ Booking reminders scheduled');
    } catch (error) {
      console.error('❌ Error scheduling booking reminders:', error);
    }
  }
}

// Create singleton instance
export default new BookingMQService();