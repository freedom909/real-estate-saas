export interface DomainEvent {
  occurredOn: Date;
  eventName: string;
  payload: any;
}

export class TenantCreatedEvent implements DomainEvent {
  readonly occurredOn = new Date();
  readonly eventName = "TenantCreated";
  constructor(
    public readonly payload: { tenantId: string; ownerUserId: string }
  ) {}
}

export class TenantSuspendedEvent implements DomainEvent {
  readonly occurredOn = new Date();
  readonly eventName = "TenantSuspended";
  constructor(public readonly payload: { tenantId: string }) {}
}