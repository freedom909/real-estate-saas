import { injectable } from "tsyringe";
import { DomainEvent } from "../../domain/events/tenant.events";
import { EventEmitter } from "events";

@injectable()
export class EventBus {
  private emitter = new EventEmitter();

  publish(event: DomainEvent) {
    console.log(`[EventBus] Publishing: ${event.eventName}`, event);
    this.emitter.emit(event.eventName, event);
  }

  subscribe(eventName: string, handler: (event: any) => void) {
    this.emitter.on(eventName, handler);
  }
}