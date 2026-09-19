// src/subgraphs/location/domain/repos/ILocationRepository.ts

import { Location } from "../entities/location";

export interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
  save(location: Location): Promise<Location>;
  findAll(): Promise<Location[]>;
}
