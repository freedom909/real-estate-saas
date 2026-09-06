import { container } from "tsyringe";

import { TOKENS_LOCATION } from "@/modules/tokens/location.tokens";
import { LocationRepository } from "@/core/location/infrastructure/persistence/location.repository";
import { GetLocationUseCase } from "@/core/location/application/usecases/getLocationUseCase";
import { GetLocationsUseCase } from "@/core/location/application/usecases/getLocationsUseCase";
import { CreateLocationUseCase } from "@/core/location/application/usecases/createLocation.usecase";

function registerLocationDependencies() {
  // Repository
  container.register(TOKENS_LOCATION.locationRepository, {
    useClass: LocationRepository,
  });

  // UseCases
  container.register(TOKENS_LOCATION.getLocationUseCase, {
    useClass: GetLocationUseCase,
  });

  container.register(TOKENS_LOCATION.getLocationsUseCase, {
    useClass: GetLocationsUseCase,
  });

  container.register(TOKENS_LOCATION.createLocationUseCase, {
    useClass: CreateLocationUseCase,
  });

  console.log("Location subgraph dependencies registered.");
}

export default registerLocationDependencies;