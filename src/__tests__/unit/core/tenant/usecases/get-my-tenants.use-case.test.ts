import "reflect-metadata";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { GetMyTenantsUseCase } from "@/core/tenant/application/usecase/get-my-tenants.use-case";
import { TenantStatus } from "@/core/tenant/domain/entities/tenant.entity";

describe("GetMyTenantsUseCase", () => {
  let membershipRepo: any;
  let tenantRepo: any;
  let useCase: GetMyTenantsUseCase;

  beforeEach(() => {
    membershipRepo = {
      findByUserId: jest.fn(),
    };
    tenantRepo = {
      findByIds: jest.fn(),
    };
    useCase = new GetMyTenantsUseCase(membershipRepo, tenantRepo);
  });

  it("rejects an unauthenticated user", async () => {
    await expect(useCase.execute("")).rejects.toThrow("Unauthenticated");
    expect(membershipRepo.findByUserId).not.toHaveBeenCalled();
  });

  it("returns an empty list when the user has no active memberships", async () => {
    membershipRepo.findByUserId.mockResolvedValue([
      { userId: "user-1", tenantId: "tenant-1", status: "REMOVED" },
      { userId: "user-1", tenantId: "tenant-2", status: "SUSPENDED" },
    ]);

    await expect(useCase.execute("user-1")).resolves.toEqual([]);
    expect(tenantRepo.findByIds).not.toHaveBeenCalled();
  });

  it("returns only active tenants for active memberships", async () => {
    membershipRepo.findByUserId.mockResolvedValue([
      { userId: "user-1", tenantId: "tenant-1", status: "ACTIVE" },
      { userId: "user-1", tenantId: "tenant-1", status: "ACTIVE" },
      { userId: "user-1", tenantId: "tenant-2", status: "REMOVED" },
      { userId: "user-1", tenantId: "tenant-3", status: "ACTIVE" },
    ]);

    const activeTenant = {
      id: "tenant-1",
      status: TenantStatus.ACTIVE,
      toJSON: () => ({ id: "tenant-1", status: TenantStatus.ACTIVE }),
    };
    const suspendedTenant = {
      id: "tenant-3",
      status: TenantStatus.SUSPENDED,
      toJSON: () => ({ id: "tenant-3", status: TenantStatus.SUSPENDED }),
    };

    tenantRepo.findByIds.mockResolvedValue([activeTenant, suspendedTenant]);

    await expect(useCase.execute("user-1")).resolves.toEqual([
      { id: "tenant-1", status: TenantStatus.ACTIVE },
    ]);

    expect(tenantRepo.findByIds).toHaveBeenCalledWith(["tenant-1", "tenant-3"]);
  });
});
