// infrastructure/events/event-bus.interface.ts

export interface IEventBus {
  publish(event: any): Promise<void>;
}