import { injectable, inject } from "tsyringe";
import { TOKENS_TENANT } from "../../domain/entities/tenant.tokens";
import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { Tenant, TenantStatus } from "../../domain/entities/tenant.entity";
import { EventBus } from "../../infrastructure/services/event-bus.service";
import { TenantCreatedEvent } from "../../domain/events/tenant.events";

@injectable()
export class CreateTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repositories.tenantRepo) 
    private repo: ITenantRepository,
    @inject(TOKENS_TENANT.services.eventBus)
    private eventBus: EventBus
  ) {}

  async execute(input: { name: string; slug: string; ownerUserId: string }) {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) {
      throw new Error("Slug already exists");
    }

    const tenant = new Tenant({
      name: input.name,
      slug: input.slug,
      ownerUserId: input.ownerUserId,
      status: TenantStatus.ACTIVE
    });

    const savedTenant = await this.repo.save(tenant);
    
    this.eventBus.publish(new TenantCreatedEvent({
      tenantId: savedTenant.id!,
      ownerUserId: savedTenant.ownerUserId
    }));

    return savedTenant.toJSON();
  }
}