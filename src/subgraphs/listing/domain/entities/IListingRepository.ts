import { Listing } from '../entities/listing';

export interface IListingRepository {
  findById(id: string): Promise<Listing | null>;
  findByHostId(hostId: string): Promise<Listing[]>;
  save(listing: Listing): Promise<Listing>;
}