//src/__tests__/unit/core/tenant/usecases/remove-membership.use-case.ts


import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { RemoveMembershipUseCase } from "@/core/tenant/application/usecase/remove-membership.use-case";
import { Membership } from "@/core/tenant/domain/entities/membership";
import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";
import { IMembershipRepository } from "@/core/tenant/domain/repos/i-membership.repository";

describe("RemoveMembershipUseCase", () => {
  let useCase: RemoveMembershipUseCase;
  let membershipRepo: jest.Mocked<IMembershipRepository>;
  let target: Membership;

  beforeEach(() => {
    membershipRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserAndTenant: jest.fn(),
      findActiveByUserAndTenant: jest.fn(),
      findByTenantId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    target = new Membership(
      "membership-1",
      "user-2",
      "tenant-1",
      MembershipRole.HOST,
      "ACTIVE",
    );

    membershipRepo.findById.mockResolvedValue(target);
    membershipRepo.save.mockImplementation(async (membership) => membership);

    useCase = new RemoveMembershipUseCase(membershipRepo);
  });

  it("allows a platform SUPER_ADMIN to remove a membership", async () => {
    const result = await useCase.execute({
      actor: {
        userId: "admin-1",
        globalRole: GlobalRole.SUPER_ADMIN,
      },
      membershipId: "membership-1",
    });

    expect(result.status).toBe("REMOVED");
    expect(membershipRepo.save).toHaveBeenCalledWith(target);
    expect(membershipRepo.save).toHaveBeenCalledTimes(1);
  });

  it("allows an active tenant OWNER to remove a non-OWNER membership", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      new Membership(
        "owner-membership",
        "owner-1",
        "tenant-1",
        MembershipRole.OWNER,
        "ACTIVE",
      ),
    );

    const result = await useCase.execute({
      actor: {
        userId: "owner-1",
        globalRole: GlobalRole.CUSTOMER,
      },
      membershipId: "membership-1",
    });

    expect(result.status).toBe("REMOVED");
    expect(membershipRepo.save).toHaveBeenCalledTimes(1);
  });

  it("rejects a HOST attempting to remove a membership", async () => {
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
        membershipId: "membership-1",
      }),
    ).rejects.toThrow("Only platform administrators or an active tenant owner");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER attempting to remove their own membership", async () => {
    target = new Membership(
      "membership-1",
      "owner-1",
      "tenant-1",
      MembershipRole.OWNER,
      "ACTIVE",
    );
    membershipRepo.findById.mockResolvedValue(target);

    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      new Membership(
        "membership-1",
        "owner-1",
        "tenant-1",
        MembershipRole.OWNER,
        "ACTIVE",
      ),
    );

    await expect(
      useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        membershipId: "membership-1",
      }),
    ).rejects.toThrow("You cannot remove your own membership");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER attempting to remove another OWNER", async () => {
    target = new Membership(
      "membership-1",
      "owner-2",
      "tenant-1",
      MembershipRole.OWNER,
      "ACTIVE",
    );
    membershipRepo.findById.mockResolvedValue(target);

    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      new Membership(
        "owner-membership",
        "owner-1",
        "tenant-1",
        MembershipRole.OWNER,
        "ACTIVE",
      ),
    );

    await expect(useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        membershipId: "membership-1",
      }),
    ).rejects.toThrow("Tenant owners cannot remove another OWNER membership");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects a missing membership", async () => {
    membershipRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actor: {
          userId: "admin-1",
          globalRole: GlobalRole.ADMIN,
        },
        membershipId: "missing-membership",
      }),
    ).rejects.toThrow("Membership not found");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });
});
