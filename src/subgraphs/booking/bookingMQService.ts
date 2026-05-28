import { injectable } from 'tsyringe';
// Explicit .js extension required for ESM/TS compilation when importing JS files
import bookingProducer from '../../MQ/producer/bookingProducer.js';

export interface BookingData {
  id: string;
  listingId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  totalCost: number;
  status: string;
}

@injectable()
export class BookingMQService {
  private producer = bookingProducer;
  private initialized = false;

  private async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.producer.initializeProducer();
      this.initialized = true;
    }
  }

  async notifyBookingCreated(bookingData: BookingData): Promise<void> {
    try {
      await this.initialize();
      await this.producer.sendBookingCreatedMessage(bookingData);
      await this.producer.sendHostNotificationMessage(bookingData, 'NEW_BOOKING');
    } catch (error) {
      console.error('❌ Error sending booking created notification:', error);
    }
  }

  async notifyBookingConfirmed(bookingData: BookingData): Promise<void> {
    try {
      await this.initialize();
      await this.producer.sendBookingConfirmedMessage(bookingData);
      await this.producer.sendHostNotificationMessage(bookingData, 'BOOKING_CONFIRMED');
    } catch (error) {
      console.error('❌ Error sending booking confirmed notification:', error);
    }
  }

  async notifyBookingCancelled(
    bookingData: BookingData,
    cancellationReason: string = 'User cancelled'
  ): Promise<void> {
    try {
      await this.initialize();
      const bookingWithReason = { ...bookingData, cancellationReason };

      await this.producer.sendBookingCancelledMessage(bookingWithReason);
      await this.producer.sendHostNotificationMessage(bookingData, 'BOOKING_CANCELLED');
    } catch (error) {
      console.error('❌ Error sending booking cancelled notification:', error);
    }
  }

  async sendBookingReminder(bookingData: BookingData, daysBefore: number): Promise<void> {
    try {
      await this.initialize();
      await this.producer.sendBookingReminderMessage(bookingData, daysBefore);
    } catch (error) {
      console.error('❌ Error sending booking reminder:', error);
    }
  }

  async sendCustomHostNotification(
    bookingData: BookingData,
    notificationType: string,
    customData: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.initialize();
      const notificationData = { ...bookingData, ...customData };
      await this.producer.sendHostNotificationMessage(notificationData, notificationType);
    } catch (error) {
      console.error('❌ Error sending custom host notification:', error);
    }
  }
}