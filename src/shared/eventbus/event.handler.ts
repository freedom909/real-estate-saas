// shared/eventbus/event-handler.ts

import { DomainEvent } from "./domain.event";

export type EventHandler<T extends DomainEvent> =
  (event: T) => Promise<void>;