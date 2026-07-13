// src/core/account/application/adapter/listing.client.ts
// Legacy HTTP client — kept for backward compatibility
// Prefer ListingGateway for new code

import axios from "axios";
import { injectable } from "tsyringe";

interface ListingExternalDTO {
  id: string;
  ownerId: string;
}

@injectable()
export class ListingClient {
  private endpoint = "http://localhost:4101/graphql";

  async fetchListingData(userId: string): Promise<ListingExternalDTO[]> {
    const query = `
      query GetListings($userId: ID!) {
        listingsByOwner(ownerId: $userId) {
          id
          ownerId
        }
      }
    `;
    const response = await axios.post(this.endpoint, {
      query,
      variables: { userId },
    });
    return response.data.data.listingsByOwner;
  }
}
