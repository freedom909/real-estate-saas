import "reflect-metadata";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { GetMembershipUseCase } from "@/core/tenant/application/usecase/get-membership.use-case";

describe("GetMembershipUseCase", () => {
  let membershipRepo: any;
  let useCase: GetMembershipUseCase;

  const target = {
    id: "membership-2",
    userId: "user-2",
    tenantId: "tenant-1",
    role: "HOST",
    status: "ACTIVE",
  };

  beforeEach(() => {
    membershipRepo = {
      findById: jest.fn(),
      findActiveByUserAndTenant: jest.fn(),
    };
    useCase = new GetMembershipUseCase(membershipRepo);
    membershipRepo.findById.mockResolvedValue(target);
  });

  it("rejects an unauthenticated actor", async () => {
    await expect(
      useCase.execute({
        actor: { userId: "", globalRole: "CUSTOMER" },
        membershipId: "membership-2",
      }),
    ).rejects.toThrow("Unauthenticated");

    expect(membershipRepo.findById).not.toHaveBeenCalled();
  });

  it("rejects a missing membership ID", async () => {
    await expect(
      useCase.execute({
        actor: { userId: "user-1", globalRole: "CUSTOMER" },
        membershipId: "",
      }),
    ).rejects.toThrow("Membership ID is required");
  });

  it("returns null when the membership does not exist", async () => {
    membershipRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actor: { userId: "user-1", globalRole: "CUSTOMER" },
        membershipId: "missing",
      }),
    ).resolves.toBeNull();
  });

  it("allows a user to read their own membership", async () => {
    const result = await useCase.execute({
      actor: { userId: "user-2", globalRole: "CUSTOMER" },
      membershipId: "membership-2",
    });

    expect(result).toEqual(target);
    expect(membershipRepo.findActiveByUserAndTenant).not.toHaveBeenCalled();
  });

  it("allows an active owner to read a membership in the same tenant", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue({
      id: "owner-membership",
      userId: "owner-1",
      tenantId: "tenant-1",
      role: "OWNER",
      status: "ACTIVE",
    });

    const result = await useCase.execute({
      actor: { userId: "owner-1", globalRole: "CUSTOMER" },
      membershipId: "membership-2",
    });

    expect(result).toEqual(target);
    expect(membershipRepo.findActiveByUserAndTenant).toHaveBeenCalledWith(
      "owner-1",
      "tenant-1",
    );
  });

  it("rejects a non-owner trying to read another user's membership", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue({
      id: "host-membership",
      userId: "user-1",
      tenantId: "tenant-1",
      role: "HOST",
      status: "ACTIVE",
    });

    await expect(
      useCase.execute({
        actor: { userId: "user-1", globalRole: "CUSTOMER" },
        membershipId: "membership-2",
      }),
    ).rejects.toThrow("Forbidden");
  });

  it("rejects a user without an active membership in the target tenant", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actor: { userId: "user-1", globalRole: "CUSTOMER" },
        membershipId: "membership-2",
      }),
    ).rejects.toThrow("Forbidden");
  });

  it("allows a platform administrator to read across tenants", async () => {
    const result = await useCase.execute({
      actor: { userId: "admin-1", globalRole: "ADMIN" },
      membershipId: "membership-2",
    });

    expect(result).toEqual(target);
    expect(membershipRepo.findActiveByUserAndTenant).not.toHaveBeenCalled();
  });

  it("allows a super administrator to read across tenants", async () => {
    const result = await useCase.execute({
      actor: { userId: "super-admin-1", globalRole: "SUPER_ADMIN" },
      membershipId: "membership-2",
    });

    expect(result).toEqual(target);
    expect(membershipRepo.findActiveByUserAndTenant).not.toHaveBeenCalled();
  });

  it("does not treat a legacy OWNER role as a platform administrator", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actor: { userId: "legacy-owner", globalRole: "OWNER" },
        membershipId: "membership-2",
      }),
    ).rejects.toThrow("Forbidden");

    expect(membershipRepo.findActiveByUserAndTenant).toHaveBeenCalled();
  });
});
