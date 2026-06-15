// shared/eventbus/domain-event.ts

export abstract class DomainEvent {
  abstract readonly eventName: string;

  readonly occurredOn: Date;
  


  constructor() {
    this.occurredOn = new Date();
  }
}