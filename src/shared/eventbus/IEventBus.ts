// shared/eventbus/event-bus.ts

import { DomainEvent } from "./domain.event";
import { EventHandler } from "./event.handler";

export interface IEventBus {
  publish<T extends DomainEvent>(
    event: T
  ): Promise<void>;

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void;

  emit<T extends DomainEvent>(
    event: T
  ): Promise<void>;

  on(eventName: string, handler: EventHandler<any>): void;
}