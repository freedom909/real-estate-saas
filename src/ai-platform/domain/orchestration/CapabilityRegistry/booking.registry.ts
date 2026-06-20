import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import { BookingCapability } from "@/ai-platform/application/capabilities/booking/booking.capability";

class CreateBookingCapability {
  constructor(private bookingCapability: BookingCapability) {}
  async execute(input: any) {
    return this.bookingCapability.createBooking(input);
  }
}

class CancelBookingCapability {
  constructor(private bookingCapability: BookingCapability) {}
  async execute(bookingId: string, reason: string) {
    return this.bookingCapability.cancelBooking(bookingId, reason);
  }
}

class ConfirmBookingCapability {
  constructor(private bookingCapability: BookingCapability) {}
  async execute(bookingId: string) {
    return this.bookingCapability.confirmBooking(bookingId);
  }
}

class CompleteBookingCapability {
  constructor(private bookingCapability: BookingCapability) {}
  async execute(bookingId: string) {
    return this.bookingCapability.completeBooking(bookingId);
  }
}

export const BookingRegistry = {
  CREATE_BOOKING: {
    domain: AIDomain.BOOKING,
    capability: CreateBookingCapability
  },
  CONFIRM_BOOKING: {
    domain: AIDomain.BOOKING,
    capability: ConfirmBookingCapability,
    dependsOn: ["CREATE_BOOKING"]
  },
  COMPLETE_BOOKING: {
    domain: AIDomain.BOOKING,
    capability: CompleteBookingCapability,
    dependsOn: ["CONFIRM_BOOKING"]
  },
  CANCEL_BOOKING: {
    domain: AIDomain.BOOKING,
    capability: CancelBookingCapability
  }
};