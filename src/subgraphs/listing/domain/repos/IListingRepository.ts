// IListingRepository.ts
import { Listing } from "../entities/listing";

export interface IListingRepository {
  create(listing: Listing): Promise<Listing>;
  findById(id: string): Promise<Listing | null>;
  findByTenantId(tenantId: string): Promise<Listing[]>;
  update(id: string, listing: Listing): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  save(listing: Listing): Promise<Listing>;
}