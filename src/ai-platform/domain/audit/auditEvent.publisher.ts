//src/ai-platform/domain/audit/auditEvent.publisher.ts

import { EventBus } from "@/infrastructure/events/event-bus";
import { AuditEvent } from "@/modules/audit/domain/event/audit.event";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

import { inject } from "tsyringe";

export class AuditEventPublisher {
  constructor(
    @inject(TOKENS_AUDIT.eventBus)
    private eventBus: EventBus
  ) {}

  async publish(event: AuditEvent) {
    await this.eventBus.publish(event);
  }
}