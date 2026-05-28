// container/root.container.ts

import { initializeBookingContainer } from "./initBookingContainer";
import { initMongoContainer } from "./initMongoContainer";
import { container } from "tsyringe";

export async function initAppContainer() {
  await initializeBookingContainer();
  await initMongoContainer();

  return container; // ✅ 统一一个 container
}