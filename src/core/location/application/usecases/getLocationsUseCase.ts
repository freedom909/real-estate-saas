//src/core/location/application/usecases/getLocationsUseCase.ts

import { injectable, inject } from "tsyringe";
import { ILocationRepository } from "../../domain/repos/ILocationRepository";
import { Location } from "../../domain/entities/location";
import { TOKENS_LOCATION } from "@/modules/tokens/location.tokens";

@injectable()
export class GetLocationsUseCase {
  constructor(
    @inject(TOKENS_LOCATION.locationRepository)
    private locationRepository: ILocationRepository
  ) {}

  async execute(locationId?: string): Promise<Location[]> {
    if (locationId) {
      const location = await this.locationRepository.findById(locationId);
      return location ? [location] : [];
    }

    return await this.locationRepository.findAll();
  }
}