// src/modules/audit/domain/types/auditEvent.publisher.ts   


import { IEventBus } from "@/shared/eventbus/IEventBus";
import { injectable, inject } from "tsyringe";

import { DomainEvent } from "@/shared/eventbus/domain.event";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";

@injectable()
export class AuditEventPublisher {
  constructor(
    @inject(TOKENS_EVENT_BUS.eventBus)
    private readonly eventBus: IEventBus
  ) {}

  async publish(event: DomainEvent) {
    await this.eventBus.publish(event);
  }
}