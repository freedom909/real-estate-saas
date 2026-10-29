export interface IListingGateway {
  getListingPrice(listingId: string): Promise<number>;
  getListingTenantId(listingId: string): Promise<string | null>;
}
