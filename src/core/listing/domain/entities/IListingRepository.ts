// IListingRepository.ts
import { Listing } from "./listing";

export interface SearchListingsQuery {
  location?: string;
  dateRange?: string;
  checkIn?: string;
  checkOut?: string;
  customerCount?: number;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface IListingRepository {
  create(listing: Listing): Promise<Listing>;
  findAll(): Promise<Listing[]>;
  findById(id: string): Promise<Listing | null>;
  findByOwnerId(ownerId: string): Promise<Listing[]>;
  findFeatured(limit?: number): Promise<Listing[]>;
  search(query: SearchListingsQuery): Promise<Listing[]>;
  update(id: string, listing: Listing): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  save(listing: Listing): Promise<Listing>;
}
