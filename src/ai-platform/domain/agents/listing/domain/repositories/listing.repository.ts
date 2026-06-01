//
// domain/repositories/listing.repository.ts

export interface IListingRepository {

  findById(
    listingId: string
  ): Promise<any>;
}