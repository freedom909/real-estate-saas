// FILE: src/subgraphs/amenity/application/useCase/GetAmenitiesByIdsUseCase.ts

import { TOKENS_AMENITY } from "@/modules/tokens/ai/amenity.tokens";
import { inject, injectable } from "tsyringe";
import { IAmenityRepository } from "../../domain/entities/IAmenityRepo";

@injectable()
export class GetAmenitiesByIdsUseCase {
  constructor(
    @inject(TOKENS_AMENITY.AmenityRepository)
    private repo: IAmenityRepository
  ) {}

  async execute(ids: string[]) {
    return this.repo.findManyByIds(ids);
  }
}