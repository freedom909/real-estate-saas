//src/core/authorization/authorizationIdentity.resolver.ts

import { GlobalRole } from "@/core/shared/domain/role";
import { AuthorizationIdentity } from "@/core/authorization/domain/authorizationIdentity";
import { AuthorizationIdentityProvider } from "@/core/authorization/application/authorizationIdentity.provider";
import { MembershipRepository } from "@/core/tenant/infrastructure/repos/membership.repo";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";

const membershipRepository =
  new MembershipRepository(MembershipModel);

const identityProvider =
  new AuthorizationIdentityProvider();

export async function resolveAuthorizationIdentity(
  source: {
    userId: string;
    globalRole: GlobalRole;
    activeTenantId?: string | null;
  }
): Promise<AuthorizationIdentity> {

  let membershipRole = null;

  if (source.activeTenantId) {
    const membership =
      await membershipRepository.findActiveByUserAndTenant(
        source.userId,
        source.activeTenantId
      );

    membershipRole = membership?.role ?? null;
  }

  return identityProvider.build({
    userId: source.userId,
    globalRole: source.globalRole,
    activeTenantId: source.activeTenantId,
    membershipRole,
  });
}