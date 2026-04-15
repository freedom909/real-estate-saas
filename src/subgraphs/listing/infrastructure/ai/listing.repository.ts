import { injectable, inject } from "tsyringe";
import { Listing } from "../../domain/entities/Listing";
import { IListingRepository } from "../../domain/repositories/IListingRepository";
import { ListingModel } from "./models/Listing.model";
import { LISTING_TOKENS } from "../../container/tokens";

// This is a placeholder for a MySQL-backed repository.
// In a real application, this would interact with a TypeORM/Sequelize repository.
@injectable()
export class ListingRepository implements IListingRepository {
  // In a real app, you'd inject a TypeORM Repository or Sequelize Model here.
  // For this example, we'll simulate a data store.
  private readonly listings: Map<string, ListingModel> = new Map();

  constructor() {
    // Seed with some dummy data for demonstration
    const dummyListing: ListingModel = {
      id: "lst-123",
      ownerId: "usr-456",
      title: "Cozy Apartment in Downtown",
      description: "A beautiful 2-bedroom apartment with city views.",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.listings.set(dummyListing.id, dummyListing);
  }

  async findById(id: string): Promise<Listing | null> {
    const model = this.listings.get(id); // Simulate fetching from DB
    if (!model) return null;
    return new Listing(model.id, model.ownerId, model.title, model.description, model.createdAt, model.updatedAt);
  }

  async save(listing: Listing): Promise<void> {
    // Simulate saving to DB (upsert)
    this.listings.set(listing.id, { ...listing, title: listing.title, description: listing.description });
  }
}