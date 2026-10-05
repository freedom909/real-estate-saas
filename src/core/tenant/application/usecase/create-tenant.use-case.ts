// src/core/tenant/application/usecase/create-tenant.use-case.ts

import { injectable, inject } from "tsyringe";

import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { Tenant, TenantStatus } from "../../domain/entities/tenant.entity";
import { Membership } from "../../domain/entities/membership";
import { MembershipRole } from "@/core/shared/domain/role";

import { EventBus } from "../../infrastructure/services/event-bus.service";
import { TenantCreatedEvent } from "../../domain/events/tenant.events";

import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { TOKENS_SHARED } from "@/modules/tokens/shared.tokens";

import { ITransactionManager } from "@/core/shared/application/transaction/i-transaction-manager";

@injectable()
export class CreateTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo)
    private readonly tenantRepo: ITenantRepository,

    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,

    @inject(TOKENS_TENANT.services.eventBus)
    private readonly eventBus: EventBus,

    @inject(TOKENS_SHARED.transactionManager)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: {
    name: string;
    slug: string;
    ownerUserId: string;
  }) {
    const existing = await this.tenantRepo.findBySlug(input.slug);

    if (existing) {
      throw new Error("Slug already exists");
    }

    const tenant = new Tenant({
      name: input.name,
      slug: input.slug,
      ownerUserId: input.ownerUserId,
      status: TenantStatus.ACTIVE,
    });

    const savedTenant = await this.transactionManager.run(async () => {
      const savedTenant = await this.tenantRepo.save(tenant);

      const ownerMembership = new Membership(
        null,
        input.ownerUserId,
        savedTenant.id!,
        MembershipRole.OWNER,
        "ACTIVE"
      );

      await this.membershipRepo.save(ownerMembership);

      return savedTenant;
    });

    this.eventBus.publish(
      new TenantCreatedEvent({
        tenantId: savedTenant.id!,
        ownerUserId: savedTenant.ownerUserId,
      })
    );

    return savedTenant.toJSON();
  }
}