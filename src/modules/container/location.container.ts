// location.container.ts

import { container } from "tsyringe";

import { TOKENS_LOCATION } from "@/modules/tokens/location.tokens";
import { LocationRepository } from "@/core/location/infrastructure/persistence/location.repository";
import { GetLocationUseCase } from "@/core/location/application/usecases/getLocationUseCase";
import { CreateLocationUseCase } from "@/core/location/application/usecases/createLocationUseCase";


function registerLocationDependencies() {
  // Repositories
container.register(TOKENS_LOCATION.locationRepository, {
  useClass: LocationRepository,
});



container.register(TOKENS_LOCATION.getLocationUseCase, {
  useClass: GetLocationUseCase,
});

container.register(TOKENS_LOCATION.createLocationUseCase, {
  useClass: CreateLocationUseCase,
});

console.log("Location subgraph dependencies registered.");
}
export default registerLocationDependencies;

