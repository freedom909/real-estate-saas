import { injectable, inject } from "tsyringe";
import { ILocationRepository } from "../../domain/repos/ILocationRepository";
import { Location } from "../../domain/entities/Location";
import { TOKENS_LOCATION } from "@/modules/tokens/ai/location.tokens";

@injectable()
export class GetLocationUseCase {
  constructor(
    @inject(TOKENS_LOCATION.locationRepository)
    private locationRepository: ILocationRepository
  ) {}

  async execute(id: string): Promise<Location | null> {
    const location = await this.locationRepository.findById(id);
    if (!location) throw new Error(`Location with ID ${id} not found`);
    return location;
  }
}
