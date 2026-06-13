// FILE: src/subgraphs/amenity/infrastructure/mappers/amenity.mapper.ts


import AmenityModel from '../models/amenityModel';
import{ Amenity } from '../../domain/entities/amenity';
import { AmenityCategory } from '../../domain/value-objects/amenityCategory';


export default class AmenityMapper {

  static toDomain(raw: AmenityModel): Amenity {
    return new Amenity({
      id: raw.id,
      name: raw.name,
      category: raw.category as AmenityCategory,
    });
  }

  static toPersistence(domain: Amenity): any {
    return {
      id: domain.id,
      name: domain.name,
      category: domain.category,
    };
  }
}  