// FILE: src/subgraphs/amenity/application/useCase/GetAmenitiesUseCase.ts

import { TOKENS_AMENITY } from "@/modules/tokens/amenity.tokens";
import { inject, injectable } from "tsyringe";

import { IAmenityRepository } from "../../domain/entities/IAmenityRepo";


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
