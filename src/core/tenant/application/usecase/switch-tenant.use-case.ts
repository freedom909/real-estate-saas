// src/core/tenant/application/usecase/switch-tenant.use-case.ts

import { injectable, inject } from "tsyringe";

import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";

import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { ISessionPort } from "@/subgraphs/auth/domain/ports/session.port";

@injectable()
export class SwitchTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private membershipRepo: IMembershipRepository,

    @inject(TOKENS_TENANT.repos.tenantRepo)
    private tenantRepo: ITenantRepository,

    @inject(TOKENS_AUTH.ports.sessionPort)
    private sessionPort: ISessionPort
  ) {}

  async execute(input: {
    userId: string;
    tenantId: string;
    sessionId: string;
  }) {
    const { userId, tenantId, sessionId } = input;

    // 1. Tenant 必须存在
    const tenant = await this.tenantRepo.findById(tenantId);

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    // 2. Tenant 必须 ACTIVE
    if (tenant.status !== "ACTIVE") {
      throw new Error("Tenant is not active");
    }

    // 3. 用户必须拥有 ACTIVE membership
    const membership =
      await this.membershipRepo.findActiveByUserAndTenant(
        userId,
        tenantId
      );

    if (!membership) {
      throw new Error("You do not have access to this tenant");
    }

    // 4. 持久化当前 Session 的 activeTenantId
    await this.sessionPort.updateActiveTenant(
      sessionId,
      tenantId
    );

    return {
      tenant: tenant.toJSON(),
      activeTenantId: tenantId,
    };
  }
}