// index.ts

import { BookingRegistry } from "./booking.registry";
import { PaymentRegistry } from "./payment.registry";
import { ListingRegistry } from "./listing.registry";
import { ReviewRegistry } from "./review.registry";
import { CapabilityRegistryMap } from "./capability-registry.types";

export const CapabilityRegistry: CapabilityRegistryMap = {
  ...BookingRegistry,
  ...PaymentRegistry,
  ...ListingRegistry,
  ...ReviewRegistry
};
