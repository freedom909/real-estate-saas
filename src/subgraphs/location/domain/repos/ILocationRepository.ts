// src/subgraphs/location/domain/repos/ILocationRepository.ts

import { Location } from "../entities/Location";

export interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
  save(location: Location): Promise<Location>;
  findAll(): Promise<Location[]>;
}
