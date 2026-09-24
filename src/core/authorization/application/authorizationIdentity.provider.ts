import {
  GlobalRole,
  MembershipRole,
} from "@/core/shared/domain/role";

import { AuthorizationIdentity } from "../domain/authorizationIdentity";

export interface AuthorizationIdentitySource {
  userId: string;
  globalRole: GlobalRole;
  activeTenantId?: string | null;
  membershipRole?: MembershipRole | null;
}

export class AuthorizationIdentityProvider {
  build(
    source: AuthorizationIdentitySource
  ): AuthorizationIdentity {
    return {
      userId: source.userId,
      globalRole: source.globalRole,
      tenantId: source.activeTenantId ?? null,
      membershipRole: source.membershipRole ?? null,
    };
  }
}
