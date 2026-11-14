// src/core/authorization/application/authorization.service.ts

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
    const { identity, resource } = request;

    // 1. Authentication
    if (!identity.userId) {
      return {
        allowed: false,
        code: AuthorizationDecisionCode.UNAUTHENTICATED,
        reason: "User is not authenticated",
      };
    }

    // 2. Resource Policy
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
    // READ: Public access
    // ----------------------------------------------

    if (action === Action.READ) {
      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Listing is publicly readable",
      };
    }

    // ----------------------------------------------
    // SUSPEND: Platform ADMIN / SUPER_ADMIN
    // ----------------------------------------------

    if (action === Action.SUSPEND) {
      if (
        identity.globalRole === GlobalRole.ADMIN ||
        identity.globalRole === GlobalRole.SUPER_ADMIN
      ) {
        return {
          allowed: true,
          code: AuthorizationDecisionCode.ALLOWED,
          reason: "Platform administrator may suspend listings",
        };
      }

      return {
        allowed: false,
        code: AuthorizationDecisionCode.GLOBAL_ROLE_DENIED,
        reason: "Only platform administrators may suspend listings",
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
    // CREATE: HOST / OWNER
    // ----------------------------------------------

    if (action === Action.CREATE) {
      if (
        identity.membershipRole === MembershipRole.HOST ||
        identity.membershipRole === MembershipRole.OWNER
      ) {
        return {
          allowed: true,
          code: AuthorizationDecisionCode.ALLOWED,
          reason: "HOST or OWNER may create listings",
        };
      }

      return {
        allowed: false,
        code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
        reason: "Membership role cannot create listings",
      };
    }

    // ----------------------------------------------
    // UPDATE: OWNER all listings / HOST own listing
    // ----------------------------------------------

    if (action === Action.UPDATE) {
      if (identity.membershipRole === MembershipRole.OWNER) {
        return {
          allowed: true,
          code: AuthorizationDecisionCode.ALLOWED,
          reason: "Tenant owner may update all tenant listings",
        };
      }

      if (identity.membershipRole === MembershipRole.HOST) {
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
            reason: "HOST may only update their own listings",
          };
        }

        return {
          allowed: true,
          code: AuthorizationDecisionCode.ALLOWED,
          reason: "HOST may update their own listing",
        };
      }

      return {
        allowed: false,
        code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
        reason: "Membership role cannot update listings",
      };
    }

    // ----------------------------------------------
    // DELETE: OWNER only
    // ----------------------------------------------

    if (action === Action.DELETE) {
      if (identity.membershipRole !== MembershipRole.OWNER) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
          reason: "Only tenant owners may delete listings",
        };
      }

      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Tenant owner may delete all tenant listings",
      };
    }

    // ----------------------------------------------
    // PUBLISH: OWNER only
    // ----------------------------------------------

    if (action === Action.PUBLISH) {
      if (identity.membershipRole !== MembershipRole.OWNER) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
          reason: "Only tenant owners may publish listings",
        };
      }

      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Tenant owner may publish listings",
      };
    }

    // ----------------------------------------------
    // UNPUBLISH: OWNER only
    // ----------------------------------------------

    if (action === Action.UNPUBLISH) {
      if (identity.membershipRole !== MembershipRole.OWNER) {
        return {
          allowed: false,
          code: AuthorizationDecisionCode.MEMBERSHIP_ROLE_DENIED,
          reason: "Only tenant owners may unpublish listings",
        };
      }

      return {
        allowed: true,
        code: AuthorizationDecisionCode.ALLOWED,
        reason: "Tenant owner may unpublish listings",
      };
    }

    return {
      allowed: false,
      code: AuthorizationDecisionCode.RESOURCE_DENIED,
      reason: "Action is not allowed for Listing",
    };
  }
}
