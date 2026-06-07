//src

import { DomainEvent }
from "@/shared/eventbus/domain.event";

export class AuditEvent
extends DomainEvent {

  readonly eventName =
    "audit.created";

  constructor(
    public readonly userId: string,
    public readonly action: string
  ) {
    super();
  }
}