import { injectable } from "tsyringe";
import { GraphQLClient, gql } from "graphql-request";
import { BookingExternalDTO } from "./BookingDTO";

@injectable()
export class BookingGateway {
  private client: GraphQLClient;

  constructor() {
    const endpoint = process.env.BOOKING_SUBGRAPH_URL || "http://localhost:4030/graphql";
    this.client = new GraphQLClient(endpoint, {
      timeout: 5000, // 5 second timeout
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
      },
    });
  }

  private readonly GET_BOOKING_QUERY = gql`
    query GetBookingDetails($id: ID!) {
      booking(id: $id) {
        id
        guestId
        totalPrice
        status
        metadata {
          ipAddress
          userAgent
        }
        guestStats {
          cancellationCount
          totalBookingsCount
        }
      }
    }
  `;

  async fetchBookingData(bookingId: string, retries = 3): Promise<BookingExternalDTO> {
    try {
      const data = await this.client.request<{ booking: BookingExternalDTO }>(
        this.GET_BOOKING_QUERY,
        { id: bookingId }
      );

      if (!data.booking) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }

      return data.booking;
    } catch (error) {
      if (retries > 0) {
        return this.fetchBookingData(bookingId, retries - 1);
      }
      throw error;
    }
  }
}