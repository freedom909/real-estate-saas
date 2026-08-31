// src/MQ/consumer/audit.consumer.ts

import { injectable, inject } from "tsyringe";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { AuditEvent } from "@/core/audit/domain/event/audit.event";
import { IAuditLogRepository } from "@/core/audit/domain/interface/audit-log.repository.interface";

@injectable()
export class AuditConsumer {
  constructor(
    @inject(TOKENS_EVENT_BUS.eventBus)
    private readonly bus: IEventBus,

    @inject(TOKENS_AUDIT.repos.auditLogRepository)
    private readonly repo: IAuditLogRepository,
  ) {
    this.bus.on("audit.created", this.handle.bind(this));
  }

  async handle(event: AuditEvent) {
    await this.repo.create({
      userId: event.userId,
      action: event.action,

      resourceId: event.resourceId,
      resourceType: event.resourceType,

      status: event.status,

      tenantId: event.tenantId,
      ownerId: event.ownerId,

      createdAt: event.occurredOn,
    });
  }
}