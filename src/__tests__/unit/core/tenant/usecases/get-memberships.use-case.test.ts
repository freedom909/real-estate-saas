import "reflect-metadata";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";
import { GetMembershipsUseCase } from "@/core/tenant/application/usecase/get-memberships.use-case";

describe("GetMembershipsUseCase", () => {
  let membershipRepo: any;
  let useCase: GetMembershipsUseCase;

  beforeEach(() => {
    membershipRepo = {
      findActiveByUserAndTenant: jest.fn(),
      findByTenantId: jest.fn(),
    };

    useCase = new GetMembershipsUseCase(membershipRepo);
  });

  it("rejects an unauthenticated actor", async () => {
    await expect(
      useCase.execute({
        actor: { userId: "", globalRole: GlobalRole.CUSTOMER },
        tenantId: "tenant-1",
      }),
    ).rejects.toThrow("Unauthenticated");

    expect(membershipRepo.findByTenantId).not.toHaveBeenCalled();
  });

  it("rejects a non-owner who is not a platform administrator", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue({
      id: "membership-1",
      userId: "user-1",
      tenantId: "tenant-1",
      role: MembershipRole.HOST,
      status: "ACTIVE",
    });

    await expect(
      useCase.execute({
        actor: { userId: "user-1", globalRole: GlobalRole.CUSTOMER },
        tenantId: "tenant-1",
      }),
    ).rejects.toThrow(
      "Only platform administrators or an active tenant owner can list memberships",
    );

    expect(membershipRepo.findByTenantId).not.toHaveBeenCalled();
  });

  it("allows an active tenant owner to list memberships", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue({
      id: "owner-membership",
      userId: "owner-1",
      tenantId: "tenant-1",
      role: MembershipRole.OWNER,
      status: "ACTIVE",
    });

    const items = [
      {
        id: "membership-2",
        userId: "user-2",
        tenantId: "tenant-1",
        role: MembershipRole.HOST,
        status: "ACTIVE",
      },
    ];

    membershipRepo.findByTenantId.mockResolvedValue({
      items,
      total: 3,
    });

    const result = await useCase.execute({
      actor: { userId: "owner-1", globalRole: GlobalRole.CUSTOMER },
      tenantId: "tenant-1",
      limit: 1,
      offset: 0,
    });

    expect(membershipRepo.findByTenantId).toHaveBeenCalledWith("tenant-1", {
      userId: undefined,
      role: undefined,
      status: undefined,
      limit: 1,
      offset: 0,
    });

    expect(result).toEqual({
      items,
      pageInfo: { total: 3, hasNextPage: true },
    });
  });

  it("allows a platform administrator without tenant owner membership", async () => {
    const items: any[] = [];

    membershipRepo.findByTenantId.mockResolvedValue({
      items,
      total: 0,
    });

    const result = await useCase.execute({
      actor: { userId: "admin-1", globalRole: GlobalRole.ADMIN },
      tenantId: "tenant-1",
    });

    expect(
      membershipRepo.findActiveByUserAndTenant,
    ).not.toHaveBeenCalled();

    expect(membershipRepo.findByTenantId).toHaveBeenCalled();
    expect(result.pageInfo).toEqual({
      total: 0,
      hasNextPage: false,
    });
  });

  it("rejects a missing tenant ID", async () => {
    await expect(
      useCase.execute({
        actor: { userId: "admin-1", globalRole: GlobalRole.ADMIN },
        tenantId: "",
      }),
    ).rejects.toThrow("tenantId is required");

    expect(membershipRepo.findByTenantId).not.toHaveBeenCalled();
  });
});
