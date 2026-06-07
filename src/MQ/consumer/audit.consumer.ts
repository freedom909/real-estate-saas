/// src/MQ/consumer/audit.consumer.ts

import { injectable, inject } from "tsyringe";


import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { AuditRepository } from "@/subgraphs/audit/repos/audit.repository";
import { IEventBus } from "@/shared/eventbus/IEventBus";


@injectable()
export class AuditConsumer {

  constructor(
    @inject(TOKENS_AUDIT.eventBus) private bus: IEventBus,
    @inject(TOKENS_AUDIT.repos.auditRepo) private repo: AuditRepository
  ) {
    this.bus.on("audit.event", this.handle.bind(this));
  }

  async handle(event: any) {
    await this.repo.create({
      action: event.type,
      userId: event.userId,
      resourceId: event.resourceId,
      metadata: event.metadata,
      timestamp: event.timestamp,
    });
  }
}