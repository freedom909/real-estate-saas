// location.container.ts

import { container } from "tsyringe";

import { TOKENS_LOCATION } from "@/modules/tokens/location.tokens";
import { LocationRepository } from "@/subgraphs/location/infrastructure/persistence/locationRepository";
import { GetLocationUseCase } from "@/subgraphs/location/application/use-cases/getLocationUseCase";
import { CreateLocationUseCase } from "@/subgraphs/location/application/use-cases/createLocationUseCase";
import { EventBus } from "@/shared/events/eventBus";


function registerLocationDependencies() {
  // Repositories
container.register(TOKENS_LOCATION.locationRepository, {
  useClass: LocationRepository,
});

container.register(TOKENS_LOCATION.eventBus, {
  useClass: EventBus,
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

