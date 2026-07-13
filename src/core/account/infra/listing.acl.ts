// ListingACL — normalizes listing data from the Listing Subgraph for the Account domain
import { injectable, inject } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { ListingGateway, ListingExternalDTO } from "./gateways/listing.gateway";

export interface ListingContextDTO {
  listingId: string;
  ownerId: string;
  title: string;
  price: number;
  rooms: number;
  maxcustomers: number;
}

@injectable()
export class ListingACL {
  constructor(
    @inject(TOKENS_ACCOUNT.ListingGateway)
    private gateway: ListingGateway
  ) {}

  /**
   * Fetch a listing and normalize it for Account domain use.
   */
  async getContext(listingId: string): Promise<ListingContextDTO> {
    const raw = await this.gateway.fetchListingData(listingId);
    return {
      listingId: raw.id,
      ownerId: raw.ownerId,
      title: raw.title,
      price: raw.price,
      rooms: raw.numOfRooms,
      maxcustomers: raw.numOfCustomers,
    };
  }

  /**
   * Fetch all listings for an owner.
   */
  async getListingsByOwner(ownerId: string): Promise<ListingExternalDTO[]> {
    return this.gateway.fetchListingsByOwner(ownerId);
  }
}
