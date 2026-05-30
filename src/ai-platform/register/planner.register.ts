// src/gateway/cognition/register/planner.register.ts
import { container, DependencyContainer } from "tsyringe";
import { Planner } from "../domain/planning/planners/planner";

import { ListingPlanner } from "../domain/planning/planners/listing/listing.planner";
import { PaymentPlanner } from "../domain/planning/planners/payment/payment.planner";
import { BookingPlanner } from "../domain/planning/planners/booking/booking.planner";

export function registerPlannerDependencies( container: DependencyContainer): void {
  container.registerSingleton(BookingPlanner);
  container.registerSingleton(ListingPlanner);
  container.registerSingleton(PaymentPlanner);
  container.registerSingleton(Planner);
}