//src/core/authorization/application/authorization.service.ts

import {
  AuthorizationDecision,
  AuthorizationDecisionCode,
} from "../domain/authorizationDecision";

import { AuthorizationRequest } from "../domain/authorizationRequest";
import { Action } from "../domain/action";
import { Resource } from "../domain/resource";
import {
  GlobalRole,
  MembershipRole,
} from "@/core/shared/domain/role";

export class AuthorizationService {
  authorize(
    request: AuthorizationRequest
  ): AuthorizationDecision {
    const { identity, action, resource } = request;

    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

    if (!identity.userId) {
      return {
        allowed: false,
        code: AuthorizationDecisionCode.UNAUTHENTICATED,
        reason: "User is not authenticated",
      };
    }

    // --------------------------------------------------
    // 2. Global Role
    // --------------------------------------------------

    if (this.isGlobalAdmin(identity.globalRole)) {
      return this.authorizeGlobalAdmin(request);
    }

    // --------------------------------------------------
    // 3. Resource Policy
    // --------------------------------------------------

    switch (resource) {
      case Resource.LISTING:
        return this.authorizeListing(request);

      default:
        return {
          allowed: false,
          code: AuthorizationDecisionCode.RESOURCE_DENIED,
          reason: `No authorization policy for resource: ${resource}`,
        };
    }
  }

  // ==================================================
  // Global Role
  // ==================================================

  private isGlobalAdmin(
    role: GlobalRole
  ): boolean {
    return (
      role === GlobalRole.ADMIN ||
      role === GlobalRole.SUPER_ADMIN
    );
  }

  private authorizeGlobalAdmin(
    request: AuthorizationRequest
  ): AuthorizationDecision {
    const { action, resource } = request;

    if (
      resource === Resource.LISTING &&
      [
        Action.READ,
        Action.CREATE,
        Action.UPDATE,
        Action.DELETE,
      ].includes(action)
    ) {
      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Global administrator access",
      };
    }

    return {
      allowed: false,
      code: AuthorizationDecisionCode.RESOURCE_DENIED,
      reason: "Action is not allowed for this resource",
    };
  }

  // ==================================================
  // Listing
  // ==================================================

  private authorizeListing(
    request: AuthorizationRequest
  ): AuthorizationDecision {
    const {
      identity,
      action,
      resourceTenantId,
      resourceOwnerId,
    } = request;

    // ----------------------------------------------
    // Public READ
    // ----------------------------------------------

    if (action === Action.READ) {
      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Listing is publicly readable",
      };
    }

    // ----------------------------------------------
    // Tenant Scope
    // ----------------------------------------------

    if (
      !identity.tenantId ||
      !resourceTenantId ||
      identity.tenantId !== resourceTenantId
    ) {
      return {
        allowed: false,
        code: AuthorizationDecisionCode.TENANT_SCOPE_DENIED,
        reason: "Resource does not belong to the active tenant",
      };
    }

    // ----------------------------------------------
    // CREATE
    // ----------------------------------------------

    if (action === Action.CREATE) {
      if (
        identity.membershipRole === MembershipRole.HOST ||
        identity.membershipRole === MembershipRole.OWNER
      ) {
        return {
          allowed: true,
          code: AuthorizationDecisionCode.ALLOWED,
          reason: "Tenant member may create listings",
        };
      }

      return {
        allowed: false,
        code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
        reason: "Membership role cannot create listings",
      };
    }

    // ----------------------------------------------
    // UPDATE
    // ----------------------------------------------

    if (action === Action.UPDATE) {
      if (
        identity.membershipRole !== MembershipRole.HOST &&
        identity.membershipRole !== MembershipRole.OWNER
      ) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
          reason: "Membership role cannot update listings",
        };
      }

      if (!resourceOwnerId) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.OWNERSHIP_DENIED,
          reason: "Resource owner is required for this action",
        };
      }

      if (resourceOwnerId !== identity.userId) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.OWNERSHIP_DENIED,
          reason: "Listing is owned by another user",
        };
      }

      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Tenant member owns the listing",
      };
    }

    // ----------------------------------------------
    // DELETE
    // ----------------------------------------------

    if (action === Action.DELETE) {
      if (
        identity.membershipRole !== MembershipRole.OWNER
      ) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
          reason: "Only tenant owners may delete listings",
        };
      }

      if (!resourceOwnerId) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.OWNERSHIP_DENIED,
          reason: "Resource owner is required for this action",
        };
      }

      if (resourceOwnerId !== identity.userId) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.OWNERSHIP_DENIED,
          reason: "Listing is owned by another user",
        };
      }

      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Tenant owner owns the listing",
      };
    }

    return {
      allowed: false,
      code: AuthorizationDecisionCode.RESOURCE_DENIED,
      reason: "Action is not allowed for Listing",
    };
  }
}