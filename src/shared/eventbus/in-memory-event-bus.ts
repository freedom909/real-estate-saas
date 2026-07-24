// shared/eventbus/in-memory-event-bus.ts

import { injectable } from "tsyringe";

import { IEventBus } from "./IEventBus";
import { DomainEvent } from "./domain.event";
import { EventHandler } from "./event.handler";

@injectable()
export class InMemoryEventBus
  implements IEventBus {
  async emit<T extends DomainEvent>(event: T): Promise<void> {
      return this.publish(event);
  }
  on(eventName: string, handler: EventHandler<any>): void {
      this.subscribe(eventName, handler);
  }

  private handlers =
    new Map<
      string,
      EventHandler<any>[]
    >();

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {

    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers
      .get(eventName)!
      .push(handler);
  }

  async publish<T extends DomainEvent>(
    event: T
  ): Promise<void> {

    const handlers =
      this.handlers.get(
        event.eventName
      ) || [];

    for (const handler of handlers) {
      await handler(event);
    }
  }
}