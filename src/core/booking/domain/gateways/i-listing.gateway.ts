
export interface BookableListing {
  id: string;
  tenantId: string;
  nightlyPrice: number;
 
  isActive: boolean;
}

export interface IListingGateway {
  getBookableListing(
    listingId: string
  ): Promise<BookableListing | null>;
}
