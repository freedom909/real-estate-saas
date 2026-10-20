//src/__tests__/unit/core/user/usecases/becomeHost.usecase.test.ts  

import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { BecomeHostUseCase } from "@/subgraphs/user/application/usecase/becomeHost.usecase";
import { MembershipRole } from "@/core/shared/domain/role";

describe("BecomeHostUseCase", () => {
  let userRepository: {
    findById: jest.Mock<any>;
  };

  let membershipRepository: {
    findActiveByUserAndTenant: jest.Mock<any>;
    save: jest.Mock<any>;
  };

  let useCase: BecomeHostUseCase;

  const user = {
    id: "user-1",
    email: "user@example.com",
  } as any;

  const activeMembership = (role: MembershipRole) =>
    ({
      id: "membership-1",
      userId: "user-1",
      tenantId: "tenant-1",
      role,
      status: "ACTIVE",
    }) as any;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    };

    membershipRepository = {
      findActiveByUserAndTenant: jest.fn(),
      save: jest.fn(),
    };

    useCase = new BecomeHostUseCase(
      userRepository as any,
      membershipRepository as any,
    );

    userRepository.findById.mockResolvedValue(user);
    membershipRepository.findActiveByUserAndTenant.mockResolvedValue(
      activeMembership(MembershipRole.HOST),
    );
  });

  it("rejects when the user does not exist", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute("user-1", "tenant-1")).rejects.toThrow(
      "User not found",
    );

    expect(membershipRepository.findActiveByUserAndTenant).not.toHaveBeenCalled();
    expect(membershipRepository.save).not.toHaveBeenCalled();
  });

  it("rejects when tenantId is missing", async () => {
    await expect(useCase.execute("user-1", null)).rejects.toThrow(
      "Active tenant is required to become a host",
    );

    expect(membershipRepository.findActiveByUserAndTenant).not.toHaveBeenCalled();
    expect(membershipRepository.save).not.toHaveBeenCalled();
  });

  it("rejects when the user has no active membership in the tenant", async () => {
    membershipRepository.findActiveByUserAndTenant.mockResolvedValue(null);

    await expect(useCase.execute("user-1", "tenant-1")).rejects.toThrow(
      "You do not have access to this tenant",
    );

    expect(membershipRepository.save).not.toHaveBeenCalled();
  });

  it("allows an existing HOST to repeat the request without saving", async () => {
    membershipRepository.findActiveByUserAndTenant.mockResolvedValue(
      activeMembership(MembershipRole.HOST),
    );

    await expect(
      useCase.execute("user-1", "tenant-1"),
    ).resolves.toBe(user);

    expect(membershipRepository.save).not.toHaveBeenCalled();
  });

  it.each([
    MembershipRole.OWNER,
    MembershipRole.AGENT,
    MembershipRole.STAFF,
    MembershipRole.MODERATOR,
  ])("rejects self-changing the %s membership role", async (role) => {
    membershipRepository.findActiveByUserAndTenant.mockResolvedValue(
      activeMembership(role),
    );

    await expect(useCase.execute("user-1", "tenant-1")).rejects.toThrow(
      "Membership role changes must be performed by an authorized tenant manager",
    );

    expect(membershipRepository.save).not.toHaveBeenCalled();
  });
});