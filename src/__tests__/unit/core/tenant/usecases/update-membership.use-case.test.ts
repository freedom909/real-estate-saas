//src/__tests__/unit/core/tenant/usecases/update-membership.use-case.test.ts


import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Membership } from "@/core/tenant/domain/entities/membership";
import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";
import { IMembershipRepository } from "@/core/tenant/domain/repos/i-membership.repository";
import { UpdateMembershipUseCase } from "@/core/tenant/application/usecase/update-membership.use-case";

describe("UpdateMembershipUseCase", () => {
  let useCase: UpdateMembershipUseCase;
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

    useCase = new UpdateMembershipUseCase(membershipRepo);
  });

  it("allows a platform ADMIN to update a membership", async () => {
    const result = await useCase.execute({
      actor: {
        userId: "admin-1",
        globalRole: GlobalRole.ADMIN,
      },
      membershipId: "membership-1",
      role: MembershipRole.AGENT,
    });

    expect(result.role).toBe(MembershipRole.AGENT);
    expect(membershipRepo.save).toHaveBeenCalledWith(target);
    expect(membershipRepo.findActiveByUserAndTenant).not.toHaveBeenCalled();
  });

  it("allows an active tenant OWNER to update another non-OWNER membership", async () => {
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
      status: "SUSPENDED",
    });

    expect(result.status).toBe("SUSPENDED");
    expect(membershipRepo.save).toHaveBeenCalledTimes(1);
  });

  it("rejects a HOST who attempts to update a membership", async () => {
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
        role: MembershipRole.AGENT,
      }),
    ).rejects.toThrow("Only platform administrators or an active tenant owner");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER attempting to manage their own membership", async () => {
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
        status: "SUSPENDED",
      }),
    ).rejects.toThrow("You cannot manage your own membership");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER attempting to update another OWNER membership", async () => {
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

    await expect(
      useCase.execute({
        actor: {
          userId: "owner-1",
          globalRole: GlobalRole.CUSTOMER,
        },
        membershipId: "membership-1",
        status: "SUSPENDED",
      }),
    ).rejects.toThrow("Tenant owners cannot manage another OWNER membership");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an OWNER attempting to grant the OWNER role", async () => {
    membershipRepo.findActiveByUserAndTenant.mockResolvedValue(
      new Membership(
        "owner-membership",
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
        role: MembershipRole.OWNER,
      }),
    ).rejects.toThrow("Tenant owners cannot grant the OWNER role");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });

  it("rejects an update with no fields", async () => {
    await expect(
      useCase.execute({
        actor: {
          userId: "admin-1",
          globalRole: GlobalRole.ADMIN,
        },
        membershipId: "membership-1",
      }),
    ).rejects.toThrow("At least one membership field must be provided");

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
        role: MembershipRole.HOST,
      }),
    ).rejects.toThrow("Membership not found");

    expect(membershipRepo.save).not.toHaveBeenCalled();
  });
});
