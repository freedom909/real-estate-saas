// ListingGateway — fetches listing data from the Listing Subgraph via GraphQL
import { injectable } from "tsyringe";
import { GraphQLClient, gql } from "graphql-request";
import { BaseGateway } from "@/infrastructure/utils/baseGateway";

export interface ListingExternalDTO {
  id: string;
  ownerId: string;
  title: string;
  price: number;
  numOfBeds: number;
  numOfCustomers: number;
  numOfRooms: number;
  picture: string[];
}

@injectable()
export class ListingGateway extends BaseGateway {
  private client: GraphQLClient;

  constructor() {
    super();
    const endpoint = process.env.LISTING_SUBGRAPH_URL || "http://localhost:4101/graphql";
    this.client = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
      },
    });
  }

  private readonly GET_LISTING_QUERY = gql`
    query GetListingDetails($id: ID!) {
      listing(id: $id) {
        id
        ownerId
        title
        price
        numOfBeds
        numOfCustomers
        numOfRooms
        picture
      }
    }
  `;

  private readonly GET_LISTINGS_BY_OWNER_QUERY = gql`
    query GetListingsByOwner($ownerId: ID!) {
      listingsByOwner(ownerId: $ownerId) {
        id
        ownerId
        title
        price
        numOfBeds
        numOfCustomers
        numOfRooms
        picture
      }
    }
  `;

  async fetchListingData(listingId: string, retries = 3): Promise<ListingExternalDTO> {
    try {
      const data = await this.client.request<{ listing: ListingExternalDTO }>(
        this.GET_LISTING_QUERY,
        { id: listingId }
      );
      if (!data.listing) {
        throw new Error(`Listing with ID ${listingId} not found`);
      }
      return data.listing;
    } catch (error) {
      if (retries > 0) {
        return this.fetchListingData(listingId, retries - 1);
      }
      throw error;
    }
  }

  async fetchListingsByOwner(ownerId: string, retries = 3): Promise<ListingExternalDTO[]> {
    try {
      const data = await this.client.request<{ listingsByOwner: ListingExternalDTO[] }>(
        this.GET_LISTINGS_BY_OWNER_QUERY,
        { ownerId }
      );
      return data.listingsByOwner || [];
    } catch (error) {
      if (retries > 0) {
        return this.fetchListingsByOwner(ownerId, retries - 1);
      }
      throw error;
    }
  }
}
