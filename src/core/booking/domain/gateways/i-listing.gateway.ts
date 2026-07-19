export interface IListingGateway {
  getListingPrice(listingId: string): Promise<number>;
}
