// modules/container/event.bus.register.ts

import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { container } from "tsyringe";
import { InMemoryEventBus } from "@/shared/eventbus/in-memory-event-bus";

export const registerEventBus = () => {
  container.registerSingleton(
    TOKENS_EVENT_BUS.eventBus,
    InMemoryEventBus
  );


  console.log(
    "✅ EventBus Registered"
  );
}
