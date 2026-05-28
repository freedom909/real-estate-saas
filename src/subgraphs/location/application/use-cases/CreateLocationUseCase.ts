import { injectable, inject } from "tsyringe";
import { ILocationRepository } from "../../domain/repos/ILocationRepository";
import { Location } from "../../domain/entities/Location";

import { TOKENS_LOCATION } from "@/modules/tokens/location.tokens";
import { IEventBus } from "@/infrastructure/events/event-bus";

export interface CreateLocationInput {
  province: string;
  country: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  name: string;
}

@injectable()
export class CreateLocationUseCase {
  constructor(
    @inject(TOKENS_LOCATION.locationRepository)
    private locationRepository: ILocationRepository,
    @inject(TOKENS_LOCATION.eventBus)
    private eventBus: IEventBus 
  ) {}

  async execute(input: CreateLocationInput): Promise<Location> {
    const location = new Location({
      name: input.name,
      province: input.province,
      city: input.city,
      country: input.country, 
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    await this.locationRepository.save(location);

    await this.eventBus.publish({
      type: "LocationCreated",
      payload: {
        name: location.name,
        locationId: location.id,
        country: location.country,
        city: location.city,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      timestamp: new Date(),
    });

    return location;
  }
}
