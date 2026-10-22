import "reflect-metadata";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { GetMyMembershipUseCase } from "@/core/tenant/application/usecase/get-my-membership.use-case";

describe("GetMyMembershipUseCase", () => {
  let membershipRepo: any;
  let useCase: GetMyMembershipUseCase;

  beforeEach(() => {
    membershipRepo = {
      findByUserAndTenant: jest.fn(),
    };
    useCase = new GetMyMembershipUseCase(membershipRepo);
  });

  it("rejects an unauthenticated user", async () => {
    await expect(
      useCase.execute({ userId: "", tenantId: "tenant-1" }),
    ).rejects.toThrow("Unauthenticated");

    expect(membershipRepo.findByUserAndTenant).not.toHaveBeenCalled();
  });

  it("rejects a missing tenant ID", async () => {
    await expect(
      useCase.execute({ userId: "user-1", tenantId: "" }),
    ).rejects.toThrow("Tenant ID is required");

    expect(membershipRepo.findByUserAndTenant).not.toHaveBeenCalled();
  });

  it("queries only the current user's membership in the specified tenant", async () => {
    const membership = {
      id: "membership-1",
      userId: "user-1",
      tenantId: "tenant-1",
      role: "HOST",
      status: "ACTIVE",
    };

    membershipRepo.findByUserAndTenant.mockResolvedValue(membership);

    await expect(
      useCase.execute({ userId: "user-1", tenantId: "tenant-1" }),
    ).resolves.toEqual(membership);

    expect(membershipRepo.findByUserAndTenant).toHaveBeenCalledTimes(1);
    expect(membershipRepo.findByUserAndTenant).toHaveBeenCalledWith(
      "user-1",
      "tenant-1",
    );
  });

  it("returns null when the current user has no membership in the tenant", async () => {
    membershipRepo.findByUserAndTenant.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: "user-1", tenantId: "tenant-2" }),
    ).resolves.toBeNull();
  });
});
