export interface IListingCapability {
  createListing(input: any): Promise<any>;
  activateListing(listingId: string): Promise<any>;
  deactivateListing(listingId: string): Promise<any>;
  optimizeListing(listingId: string): Promise<any>;
  analyzeListing(listingId: string): Promise<any>;
}
