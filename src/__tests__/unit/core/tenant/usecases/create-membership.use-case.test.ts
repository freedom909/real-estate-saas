//src/__tests__/unit/core/tenant/usecases/create-membership.use-case.test.ts

import "reflect-metadata"
import { CreateMembershipUseCase } from "@/core/tenant/application/usecase/create-membership.use-case";
import { Membership } from "@/core/tenant/domain/entities/membership";
import { Tenant, TenantStatus } from "@/core/tenant/domain/entities/tenant.entity";
import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";
import { ITenantRepository } from "@/core/tenant/domain/repos/i-tenant.repository";
import { IMembershipRepository } from "@/core/tenant/domain/repos/i-membership.repository";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

describe("CreateMembershipUseCase", () => {
  let useCase: CreateMembershipUseCase;
  let tenantRepo: jest.Mocked<ITenantRepository>;
  let membershipRepo: jest.Mocked<IMembershipRepository>;

  const tenant = new Tenant({
    id: "tenant-1",
    name: "Kyoto Stays",
    slug: "kyoto-stays",
    ownerUserId: "owner-1",
    status: TenantStatus.ACTIVE,
  });

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

    tenantRepo.findById.mockResolvedValue(tenant);
    membershipRepo.findByUserAndTenant.mockResolvedValue(null);

    useCase = new CreateMembershipUseCase(
      tenantRepo,
      membershipRepo,
    );
  });

  it("allows a platform ADMIN to create a HOST membership", async () => {
    const saved = new Membership(
      "membership-1",
      "user-2",
      "tenant-1",
      MembershipRole.HOST,
      "ACTIVE",
    );

    membershipRepo.save.mockResolvedValue(saved);
membershipRepo.create.mockResolvedValue(saved);
    const result = await useCase.execute({
      actor: {
        userId: "admin-1",
        globalRole: GlobalRole.ADMIN,
      },
      status: TenantStatus.ACTIVE,
      tenantId: "tenant-1",
      userId: "user-2",
      role: MembershipRole.HOST,
    });

    expect(membershipRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-2",
        tenantId: "tenant-1",
        role: MembershipRole.HOST,
        status: "ACTIVE",
      }),
    );
     expect(result).toBe(saved);
    expect(membershipRepo.findActiveByUserAndTenant).not.toHaveBeenCalled();
  });

  it("allows an active tenant OWNER to create a HOST membership", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      new Membership(
        "owner-membership",
        "owner-1",
        "tenant-1",
        MembershipRole.OWNER,
        "ACTIVE",
      ),
    );

    membershipRepo.create.mockResolvedValue(
      new Membership(
        "membership-1",
        "user-2",
        "tenant-1",
        MembershipRole.HOST,
        "ACTIVE",
      ),
    );

    await expect(
      useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "tenant-1",
        userId: "user-2",
        role: MembershipRole.HOST,
      }),
    ).resolves.toMatchObject({
      userId: "user-2",
      tenantId: "tenant-1",
      role: MembershipRole.HOST,
    });
  });

  it("rejects a HOST who attempts to create a membership", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      new Membership(
        "host-membership",
        "host-1",
        "tenant-1",
        MembershipRole.HOST,
        "ACTIVE",
      ),
    );

    await expect(
      useCase.execute({
        actor: {
          userId: "host-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "tenant-1",
        userId: "user-2",
        
        role: MembershipRole.HOST,
      }),
    ).rejects.toThrow("Only platform administrators or an active tenant owner");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER attempting to grant OWNER to another user", async () => {
    await expect(
      useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "tenant-1",
        userId: "user-2",
        role: MembershipRole.OWNER,
      }),
    ).rejects.toThrow("Tenant owners cannot grant the OWNER role");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER attempting to create their own membership", async () => {
    await expect(
      useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "tenant-1",
        userId: "owner-1",
        role: MembershipRole.HOST,
      }),
    ).rejects.toThrow("You cannot create your own membership");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER without an active OWNER membership", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "tenant-1",
        userId: "user-2",
        role: MembershipRole.HOST,
      }),
    ).rejects.toThrow("Only platform administrators or an active tenant owner");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects duplicate memberships without overwriting the existing record", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      new Membership(
        "owner-membership",
        "owner-1",
        "tenant-1",
        MembershipRole.OWNER,
        "ACTIVE",
      ),
    );

    membershipRepo.findByUserAndTenant.mockResolvedValue(
      new Membership(
        "existing-membership",
        "user-2",
        "tenant-1",
        MembershipRole.AGENT,
        "ACTIVE",
      ),
    );

    await expect(
      useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "tenant-1",
        userId: "user-2",
        role: MembershipRole.HOST,
      }),
    ).rejects.toThrow("Membership already exists");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects a missing tenant", async () => {
    tenantRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actor: {
          userId: "admin-1",
          globalRole: GlobalRole.ADMIN,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "missing-tenant",
        userId: "user-2",
        role: MembershipRole.HOST,
      }),
    ).rejects.toThrow("Tenant not found");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects a suspended tenant", async () => {
    tenantRepo.findById.mockResolvedValue(
      new Tenant({
        id: "tenant-1",
        name: "Kyoto Stays",
        slug: "kyoto-stays",
        ownerUserId: "owner-1",
        status: TenantStatus.SUSPENDED,
      }),
    );

    await expect(
      useCase.execute({
        actor: {
          userId: "admin-1",
          globalRole: GlobalRole.ADMIN,
        },
        status: TenantStatus.ACTIVE,
        tenantId: "tenant-1",
        userId: "user-2",
        role: MembershipRole.HOST,
      }),
    ).rejects.toThrow("Only ACTIVE tenants can accept memberships");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });
});
