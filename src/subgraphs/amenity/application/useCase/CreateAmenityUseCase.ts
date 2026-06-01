// FILE: src/subgraphs/amenity/application/useCase/CreateAmenityUseCase.ts

import { TOKENS_AMENITY } from "@/modules/tokens/amenity.tokens";
import { inject, injectable } from "tsyringe";
import { IAmenityRepository } from "../../domain/entities/IAmenityRepo";
import { AmenityFactory } from "../../domain/factories/AmenityFactory";
import { AmenityCategory } from "../../domain/value-objects/AmenityCategory";

interface CreateAmenityInput {
  name: string;
  category: AmenityCategory;
}

@injectable()
export class CreateAmenityUseCase {
  constructor(
    @inject(TOKENS_AMENITY.AmenityRepository)
    private repo: IAmenityRepository
  ) {}

  async execute(input: CreateAmenityInput) { 
    const amenity = AmenityFactory.create({
      name: input.name,
      category: input.category
    });


    await this.repo.save(amenity);

    return {
      success: true,
      code: 200,
      message: "Amenity created",
      amenity,
    };
  }
}