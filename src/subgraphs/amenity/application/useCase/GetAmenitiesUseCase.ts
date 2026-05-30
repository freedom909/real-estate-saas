// FILE: src/subgraphs/amenity/application/useCase/GetAmenitiesUseCase.ts

import { TOKENS_AMENITY } from "@/modules/tokens/ai/amenity.tokens";
import { inject, injectable } from "tsyringe";

import AmenityMapper from "@/subgraphs/amenity/infrastructure/mappers/amenity.mapper";
import { IAmenityRepository } from "../../domain/entities/IAmenityRepo";
import AmenityModel from "../../infrastructure/models/amenityModel";
import { Amenity } from "../../domain/entities/amenity";

@injectable()
export class GetAmenitiesUseCase {
  constructor(
    @inject(TOKENS_AMENITY.AmenityRepository)
    private repo: IAmenityRepository
  ) {}

  async execute() {
    const amenities = await this.repo.findAll();
    return amenities
  }
}
