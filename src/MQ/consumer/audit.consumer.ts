/// src/MQ/consumer/audit.consumer.ts

import { injectable, inject } from "tsyringe";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { AuditRepository } from "@/subgraphs/audit/repos/audit.repository";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { AuditEvent } from "@/modules/audit/domain/event/audit.event";

@injectable()
export class AuditConsumer {
  constructor(
    @inject(TOKENS_EVENT_BUS.eventBus) private bus: IEventBus,
    @inject(AuditRepository) private repo: AuditRepository
  ) {
    this.bus.on("audit.created", this.handle.bind(this));
  }

  async handle(event: AuditEvent) {
    await this.repo.create({
      action: event.action,
      userId: event.userId,
      resourceId: event.userId,
      timestamp: event.occurredOn,
    });
  }
}
