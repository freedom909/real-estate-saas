//src/core/location/application/usecases/CreateLocationUseCase.ts

import { injectable, inject } from "tsyringe";
import { ILocationRepository } from "../../domain/repos/ILocationRepository";
import { Location } from "../../domain/entities/location";

import { TOKENS_LOCATION } from "@/modules/tokens/location.tokens";
import { EventBus } from "@/core/tenant/infrastructure/services/event-bus.service";


export interface CreateLocationInput {
  name: string;

  country: string;

  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
  address: string;

  latitude: number;
  longitude: number;
  radius: number;
  units: string;
}


@injectable()
export class CreateLocationUseCase {
  constructor(
    @inject(TOKENS_LOCATION.locationRepository)
    private locationRepository: ILocationRepository,

    @inject(TOKENS_LOCATION.eventBus)
    private eventBus: EventBus
  ) {}

  async execute(input: CreateLocationInput): Promise<Location> {
    const location = new Location({
      name: input.name,

      postalCode: input.postalCode,
      prefecture: input.prefecture,
      city: input.city,
      town: input.town,
      address: input.address,

      latitude: input.latitude,
      longitude: input.longitude,
      radius: input.radius,
      units: input.units,
    });

    await this.locationRepository.save(location);

    this.eventBus.publish({
      eventName: "LocationCreated",

      payload: {
        name: location.name,
        locationId: location.id,

        postalCode: location.postalCode,
        prefecture: location.prefecture,
        city: location.city,
        town: location.town,
        address: location.address,

        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius,
        units: location.units,
      },

      occurredOn: new Date(),
    });

    return location;
  }
}

