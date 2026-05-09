// src/subgraphs/location/infrastructure/persistence/LocationRepository.ts

import { injectable } from "tsyringe";
import { ILocationRepository } from "../../domain/repos/ILocationRepository";
import { Location } from "../../domain/entities/location";

@injectable()
export class LocationRepository implements ILocationRepository {
  private locations: Map<string, Location> = new Map();

  async findById(id: string): Promise<Location | null> {
    return this.locations.get(id) || null;
  }

  async save(location: Location): Promise<Location> {
    this.locations.set(location.id, location);
    console.log(`Location saved: ${location.id} - ${location.name}`);
    return location;
  }

  async findAll(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
}
