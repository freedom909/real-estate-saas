// src/core/booking/infrastructure/gateways/listing.gateway.ts


import { injectable } from "tsyringe";
import { GraphQLClient, gql } from "graphql-request";

import {
  IListingGateway,
  BookableListing,
} from "../../domain/gateways/i-listing.gateway";

const GET_BOOKABLE_LISTING = gql`
  query GetBookableListing($id: ID!) {
    listing(id: $id) {
      id
      tenantId
      pricePerNight
      isBookable
      
    }
  }
`;

interface GetBookableListingResponse {
  listing: {
    id: string;
    tenantId: string | null;
    pricePerNight: number;
    isBookable: boolean;
  } | null;
}

@injectable()
export class ListingGateway implements IListingGateway {
  private client: GraphQLClient;

  constructor() {
    const endpoint =
      process.env.LISTING_SUBGRAPH_URL ||
      "http://localhost:4101/graphql";

    const serviceToken =
      process.env.INTERNAL_SERVICE_TOKEN;

    if (!serviceToken) {
      throw new Error(
        "INTERNAL_SERVICE_TOKEN is not configured"
      );
    }

    this.client = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${serviceToken}`,
        "x-service-token": serviceToken,
      },
    });
  }

  async getBookableListing(
    listingId: string
  ): Promise<BookableListing | null> {

    const data =
      await this.client.request<GetBookableListingResponse>(
        GET_BOOKABLE_LISTING,
        { id: listingId }
      );

    const listing = data.listing;

    if (!listing) {
      return null;
    }

    if (!listing.tenantId) {
      throw new Error(
        `Listing ${listingId} has no tenant`
      );
    }

    return {
      id: listing.id,
      tenantId: listing.tenantId,
      nightlyPrice: listing.pricePerNight,
     
      isBookable: listing.isBookable,
    };
  }
}
