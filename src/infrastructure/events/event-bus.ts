// infrastructure/events/event-bus.interface.ts

export interface EventBus {
  publish(event: any): Promise<void>;
}