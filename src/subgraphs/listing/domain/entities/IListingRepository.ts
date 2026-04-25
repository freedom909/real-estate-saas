import { Listing } from '../entities/Listing';

export interface IListingRepository {
  findById(id: string): Promise<Listing | null>;
  findByTenantId(tenantId: string): Promise<Listing[]>;
  save(listing: Listing): Promise<Listing>;
}