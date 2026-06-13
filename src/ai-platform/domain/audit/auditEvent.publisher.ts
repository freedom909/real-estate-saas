//src/ai-platform/domain/audit/auditEvent.publisher.ts

import { DomainEvent } from "@/shared/eventbus/domain.event";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import  {IEventBus}  from "@/shared/eventbus/IEventBus";

import { inject } from "tsyringe";

export class AuditEventPublisher {
  constructor(
    @inject(TOKENS_AUDIT.eventBus)
    private eventBus: IEventBus
  ) {}

  async publish(event: DomainEvent) {
    await this.eventBus.publish(event);
  }
}