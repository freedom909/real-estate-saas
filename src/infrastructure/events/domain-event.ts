// infrastructure/events/domain-event.interface.ts
export interface DomainEvent {
  eventName: string;
  eventBody: any;
}