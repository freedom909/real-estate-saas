// domain/factories/AmenityFactory.ts


import { v4 as uuidv4 } from "uuid";
import { Amenity } from "../entities/amenity";
import { AmenityCategory } from "../value-objects/AmenityCategory";

interface CreateAmenityInput {
  name: string;
  category: AmenityCategory;
}

export class AmenityFactory {
  static create(input: CreateAmenityInput): Amenity {
    return new Amenity({
      id: `amenity-${uuidv4()}`, // 统一 ID 规范
      name: input.name.trim(),
      category: input.category,
    });
  }
}