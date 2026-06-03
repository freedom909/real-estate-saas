import { injectable } from "tsyringe";

@injectable()
export class BookingGateway {
  /**
   * Communicates with the external Booking Subgraph via GraphQL/SDK.
   * This layer ensures the AI subgraph never imports Booking entities directly.
   */
  async fetchBookingData(bookingId: string) {
    // Simulated fetch from Booking Subgraph
    return {
      id: bookingId,
      guestId: "user_123",
      price: 450.00,
      state: "PENDING",
      security: {
        ip: "192.168.1.1",
        browser: "Mozilla/5.0"
      },
      stats: {
        cancels: 0,
        total: 5
      }
    };
  }
}