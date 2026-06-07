import { injectable, inject } from "tsyringe";
import { TOKENS_TENANT } from "../../domain/entities/tenant.tokens";
import { ITenantRepository } from "../../domain/repos/i-tenant.repository";

import { TenantSuspendedEvent } from "../../domain/events/tenant.events";
import { EventBus } from "../../infrastructure/services/event-bus.service";

@injectable()
export class SuspendTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repositories.tenantRepo) private repo: ITenantRepository,
    @inject(TOKENS_TENANT.services.eventBus) private eventBus: EventBus
  ) {}

  async execute(tenantId: string) {
    const tenant = await this.repo.findById(tenantId);
    if (!tenant) throw new Error("Tenant not found");

    tenant.suspend();
    const updated = await this.repo.update(tenant);

    this.eventBus.publish(new TenantSuspendedEvent({ tenantId: updated.id! }));

    return updated.toJSON();
  }
}