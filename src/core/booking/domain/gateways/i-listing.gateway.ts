export interface BookableListing {
  id: string;
  tenantId: string;
  nightlyPrice: number;
  isBookable: boolean;
}

export interface IListingGateway {
  getBookableListing(
    listingId: string
  ): Promise<BookableListing | null>;
}