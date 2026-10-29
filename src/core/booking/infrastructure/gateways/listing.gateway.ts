import { injectable } from "tsyringe";
import { GraphQLClient, gql } from "graphql-request";
import { IListingGateway } from "../../domain/gateways/i-listing.gateway";

const GET_LISTING_PRICE = gql`
  query GetListingPrice($id: ID!) {
    listing(id: $id) {
      id
      pricePerNight
    }
  }
`;

const GET_LISTING_TENANT = gql`
  query GetListingTenant($id: ID!) {
    listing(id: $id) {
      id
      tenantId
    }
  }
`;

@injectable()
export class ListingGateway implements IListingGateway {
  private client: GraphQLClient;

  constructor() {
    const endpoint = process.env.LISTING_SUBGRAPH_URL || "http://localhost:4101/graphql";
    this.client = new GraphQLClient(endpoint, {
      headers: {
           Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
    "x-service-token": process.env.INTERNAL_SERVICE_TOKEN ?? "",
      },
    });
  }

  async getListingPrice(listingId: string): Promise<number> {
    const data = await this.client.request<{ listing: { pricePerNight: number } | null }>(
      GET_LISTING_PRICE,
      { id: listingId }
    );

    if (!data.listing) {
      throw new Error(`Listing ${listingId} not found`);
    }

    return data.listing.pricePerNight;
  }

  async getListingTenantId(listingId: string): Promise<string | null> {
    const data = await this.client.request<{ listing: { tenantId: string | null } | null }>(
      GET_LISTING_TENANT,
      { id: listingId }
    );
    return data.listing?.tenantId ?? null;
  }
}