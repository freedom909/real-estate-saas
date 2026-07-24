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

  async execute(): Promise<Location[]> {
    return await this.locationRepository.findAll();
  }
}
