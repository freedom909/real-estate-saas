// index.ts

import { BookingRegistry } from "./booking.registry";
import { PaymentRegistry } from "./payment.registry";
import { ListingRegistry } from "./listing.registry";
import { ReviewRegistry } from "./review.registry";

export const CapabilityRegistry = {
  ...BookingRegistry,
  ...PaymentRegistry,
  ...ListingRegistry,
  ...ReviewRegistry
};
