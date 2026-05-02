// IListingRepository.ts
import { Listing } from "../entities/Listing";

export interface IListingRepository {
  create(listing: Listing): Promise<Listing>;
  findById(id: string): Promise<Listing | null>;
  findByHostId(hostId: string): Promise<Listing[]>;
  update(id: string, listing: Listing): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  save(listing: Listing): Promise<Listing>;
}