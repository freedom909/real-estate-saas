// src/core/authorization/domain/authorizationIdentity.ts

import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";

export interface AuthorizationIdentity {
  userId: string;

  globalRole: GlobalRole;

  tenantId?: string | null;

  membershipRole?: MembershipRole | null;
}