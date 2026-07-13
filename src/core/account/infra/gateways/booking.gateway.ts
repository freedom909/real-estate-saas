// Account BookingGateway — fetches booking data for Account dashboard queries
import { injectable } from "tsyringe";
import { GraphQLClient, gql } from "graphql-request";
import { BaseGateway } from "@/infrastructure/utils/baseGateway";

export interface BookingExternalDTO {
  id: string;
  customerId: string;
  listingId: string;
  price: number;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
  customerStats?: {
    cancellationCount?: number;
    totalBookingsCount?: number;
  };
}

@injectable()
export class BookingGateway extends BaseGateway {
  async fetchBookingDataByListingIds(listingIds: string[]) {
    return this.fetchBookingData(listingIds.join(","));
  }
  private client: GraphQLClient;

  constructor() {
    super();
    const endpoint = process.env.BOOKING_SUBGRAPH_URL || "http://localhost:4030/graphql";
    this.client = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
      },
    });
  }

  private readonly GET_BOOKINGS_FOR_CUSTOMER = gql`
    query GetBookingsForCustomer($userId: ID!) {
      bookingsForCustomer(userId: $userId) {
        id
        customerId
        listingId
        price
        status
        checkInDate
        checkOutDate
        createdAt
      }
    }
  `;

  async fetchBookingData(userId: string, retries = 3): Promise<BookingExternalDTO[]> {
    try {
      const data = await this.client.request<{ bookingsForCustomer: BookingExternalDTO[] }>(
        this.GET_BOOKINGS_FOR_CUSTOMER,
        { userId }
      );
      return data.bookingsForCustomer || [];
    } catch (error) {
      if (retries > 0) {
        return this.fetchBookingData(userId, retries - 1);
      }
      throw error;
    }
  }
}
