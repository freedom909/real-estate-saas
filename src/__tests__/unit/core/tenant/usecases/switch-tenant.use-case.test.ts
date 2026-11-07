// src/__tests__/unit/core/tenant/usecases/switch-tenant.use-case.test.ts


import "reflect-metadata";

import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { SwitchTenantUseCase } from "@/core/tenant/application/usecase/switch-tenant.use-case";

import { Tenant, TenantStatus } from "@/core/tenant/domain/entities/tenant.entity";
import { Membership } from "@/core/tenant/domain/entities/membership";

import { MembershipRole } from "@/core/shared/domain/role";

import { ITenantRepository } from "@/core/tenant/domain/repos/i-tenant.repository";
import { IMembershipRepository } from "@/core/tenant/domain/repos/i-membership.repository";

import { ISessionPort } from "@/subgraphs/auth/domain/ports/session.port";

describe("SwitchTenantUseCase", () => {
  let useCase: SwitchTenantUseCase;

  let tenantRepo: jest.Mocked<ITenantRepository>;
  let membershipRepo: jest.Mocked<IMembershipRepository>;
  let sessionPort: jest.Mocked<ISessionPort>;

  const userId = "user-1";
  const tenantId = "tenant-1";
  const sessionId = "session-1";

  const tenant = new Tenant({
    id: tenantId,
    name: "Kyoto Stays",
    slug: "kyoto-stays",
    ownerUserId: userId,
    status: TenantStatus.ACTIVE,
  });

  const activeMembership = new Membership(
    "membership-1",
    userId,
    tenantId,
    MembershipRole.OWNER,
    "ACTIVE",
  );

  beforeEach(() => {
    tenantRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      paginate: jest.fn(),
    };

    membershipRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserAndTenant: jest.fn(),
      findActiveByUserAndTenant: jest.fn(),
      findByTenantId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    sessionPort = {
      createSession: jest.fn(),
      revokeSession: jest.fn(),
      updateActiveTenant: jest.fn(),
      findSessionById: jest.fn(),

    rotateRefreshTokenId: jest.fn(
    async (_input: Parameters<ISessionPort["rotateRefreshTokenId"]>[0]) => false
  ),
};

    tenantRepo.findById.mockResolvedValue(tenant);

    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      activeMembership,
    );

    sessionPort.updateActiveTenant.mockResolvedValue(undefined);

    useCase = new SwitchTenantUseCase(
      membershipRepo,
      tenantRepo,
      sessionPort,
    );
  });

  it("switches to an active tenant when the user has an active membership", async () => {
    const result = await useCase.execute({
      userId,
      tenantId,
      sessionId,
    });

    expect(tenantRepo.findById).toHaveBeenCalledWith(tenantId);

    expect(
      membershipRepo.findActiveByUserAndTenant,
    ).toHaveBeenCalledWith(userId, tenantId);

    expect(sessionPort.updateActiveTenant).toHaveBeenCalledWith(
      userId,
      sessionId,
      tenantId,
    );

    expect(result).toEqual({
      tenant: tenant.toJSON(),
      activeTenantId: tenantId,
    });
  });

  it("rejects a missing tenant", async () => {
    tenantRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, tenantId, sessionId }),
    ).rejects.toThrow("Tenant not found");

    expect(
      membershipRepo.findActiveByUserAndTenant,
    ).not.toHaveBeenCalled();

    expect(sessionPort.updateActiveTenant).not.toHaveBeenCalled();
  });

  it("rejects a suspended tenant", async () => {
    const suspendedTenant = new Tenant({
      id: tenantId,
      name: "Kyoto Stays",
      slug: "kyoto-stays",
      ownerUserId: userId,
      status: TenantStatus.SUSPENDED,
    });

    tenantRepo.findById.mockResolvedValue(suspendedTenant);

    await expect(
      useCase.execute({ userId, tenantId, sessionId }),
    ).rejects.toThrow("Tenant is not active");

    expect(
      membershipRepo.findActiveByUserAndTenant,
    ).not.toHaveBeenCalled();

    expect(sessionPort.updateActiveTenant).not.toHaveBeenCalled();
  });

  it("rejects a user without an active membership", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, tenantId, sessionId }),
    ).rejects.toThrow("You do not have access to this tenant");

    expect(sessionPort.updateActiveTenant).not.toHaveBeenCalled();
  });

  it("updates only the current session's active tenant", async () => {
    await useCase.execute({
      userId,
      tenantId,
      sessionId,
    });

    expect(sessionPort.updateActiveTenant).toHaveBeenCalledTimes(1);

    expect(sessionPort.updateActiveTenant).toHaveBeenCalledWith(
      userId,
      sessionId,
      tenantId,
    );
  });

  it("does not update the session when membership validation fails", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, tenantId, sessionId }),
    ).rejects.toThrow();

    expect(sessionPort.updateActiveTenant).not.toHaveBeenCalled();
  });

  it("propagates session update errors", async () => {
    sessionPort.updateActiveTenant.mockRejectedValue(
      new Error("Invalid or inactive session"),
    );

    await expect(
      useCase.execute({ userId, tenantId, sessionId }),
    ).rejects.toThrow("Invalid or inactive session");
  });
});
