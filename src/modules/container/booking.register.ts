// container.ts

import { EventBus } from "@/infrastructure/events/event-bus";
import { SequelizeBookingRepository } from "@/subgraphs/booking/infrastructure/repositories/sequelizeBookingRepository";
import { container } from "tsyringe";


container.register("EventBus", { useClass: EventBus });
container.register("BookingRepository", {
  useClass: SequelizeBookingRepository,
});