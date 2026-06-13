// FILE: src/subgraphs/amenity/domain/entities/IAmenityRepo.ts

import { Amenity } from "./amenity";


export interface IAmenityRepository {
    findById(id: string): Promise<Amenity | null>;
    findManyByIds(ids: string[]): Promise<Amenity[]>;
    save(amenity: Amenity): Promise<Amenity>;
    findAll(): Promise<Amenity[]>;
}
