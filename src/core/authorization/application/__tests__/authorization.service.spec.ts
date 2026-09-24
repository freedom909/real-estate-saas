import { AuthorizationService } from "../authorization.service";
import {
  AuthorizationDecisionCode,
} from "../../domain/authorizationDecision";
import { Action } from "../../domain/action";
import { Resource } from "../../domain/resource";
import {
  GlobalRole,
  MembershipRole,
} from "@/core/shared/domain/role";
import { describe, expect, it } from "@jest/globals";

describe("AuthorizationService", () => {
  const service = new AuthorizationService();

  describe("authentication", () => {
    it("denies unauthenticated requests", () => {
      const decision = service.authorize({
        identity: {
          userId: "",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: null,
          membershipRole: null,
        },
        action: Action.READ,
        resource: Resource.LISTING,
      });

      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.UNAUTHENTICATED
      );
    });
  });

  describe("tenant scope", () => {
    it("allows HOST to create a listing inside the active tenant", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-host-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.HOST,
        },
        action: Action.CREATE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
      });

      expect(decision.allowed).toBe(true);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.ALLOWED
      );
    });

    it("denies HOST when the listing belongs to another tenant", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-host-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.HOST,
        },
        action: Action.CREATE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-002",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.TENANT_SCOPE_DENIED
      );
    });
  });

    describe("ownership", () => {
    it("allows HOST to update their own listing", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-host-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.HOST,
        },
        action: Action.UPDATE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
        resourceOwnerId: "user-host-001",
      });

      expect(decision.allowed).toBe(true);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.ALLOWED
      );
    });

    it("denies HOST when updating another user's listing", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-host-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.HOST,
        },
        action: Action.UPDATE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
        resourceOwnerId: "user-host-002",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.OWNERSHIP_DENIED
      );
    });
  });

    describe("delete ownership", () => {
    it("denies HOST from deleting a listing", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-host-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.HOST,
        },
        action: Action.DELETE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
        resourceOwnerId: "user-host-001",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED
      );
    });

    it("allows OWNER to delete their own listing", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-owner-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.OWNER,
        },
        action: Action.DELETE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
        resourceOwnerId: "user-owner-001",
      });

      expect(decision.allowed).toBe(true);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.ALLOWED
      );
    });

    it("denies OWNER from deleting another user's listing", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-owner-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.OWNER,
        },
        action: Action.DELETE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
        resourceOwnerId: "user-host-001",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.OWNERSHIP_DENIED
      );
    });
  });

    describe("ownership metadata", () => {
    it("denies HOST update when resource owner is missing", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-host-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.HOST,
        },
        action: Action.UPDATE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.OWNERSHIP_DENIED
      );
    });

    it("denies OWNER delete when resource owner is missing", () => {
      const decision = service.authorize({
        identity: {
          userId: "user-owner-001",
          globalRole: GlobalRole.CUSTOMER,
          tenantId: "tenant-001",
          membershipRole: MembershipRole.OWNER,
        },
        action: Action.DELETE,
        resource: Resource.LISTING,
        resourceTenantId: "tenant-001",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.code).toBe(
        AuthorizationDecisionCode.OWNERSHIP_DENIED
      );
    });
  });
});
