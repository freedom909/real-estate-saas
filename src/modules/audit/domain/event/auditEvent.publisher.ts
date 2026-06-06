// src/modules/audit/domain/types/auditEvent.publisher.ts   

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { EventBus } from "@/shared/events/eventBus";
import { injectable, inject } from "tsyringe";
import { AuditLogEvent } from "./audit-log.event";




@injectable()
export class AuditEventPublisher {

  constructor(
    @inject(TOKENS_AUDIT.eventBus) private bus: EventBus
  ) {}

  publish(event: AuditLogEvent) {
    this.bus.emit(event);
  }
} 