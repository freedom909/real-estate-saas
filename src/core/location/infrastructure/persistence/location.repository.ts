// src/subgraphs/location/infrastructure/persistence/LocationRepository.ts

import { inject, injectable } from "tsyringe";
import { ILocationRepository } from "../../domain/repos/ILocationRepository";
import { Location } from "../../domain/entities/location";


@injectable()
export class LocationRepository implements ILocationRepository {
 
  private location: Map<string, Location> = new Map();

  async findById(id: string): Promise<Location | null> {
    return this.location.get(id) || null;
  }

  async save(location: Location): Promise<Location> {
    this.location.set(location.id, location);
    console.log(`Location saved: ${location.id} - ${location.name}`);
    return location;
  }

  async findAll(): Promise<Location[]> {
    return Array.from(this.location.values());
  }
}