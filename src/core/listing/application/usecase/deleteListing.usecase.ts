import { inject, injectable } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

import { IPolicyEngine } from "@/rbac/policyContext";
import { Action, Resource } from "@/rbac/types";
import { Role } from "@/core/shared/domain/role";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import ListingActor from "./listingActor";
import { AuditLogService } from "@/core/audit/application/write/services/audit.logger";



@injectable()
export class DeleteListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly listingRepository: IListingRepository,

    @inject(TOKENS_AUDIT.services.auditLogger)
    private readonly auditLogger: AuditLogService,

    @inject(TOKENS_LISTING.policyEngine)
    private readonly policyEngine: IPolicyEngine,
  ) {}
 

  async execute(
  listingId: string,
  actor: ListingActor,
) {
  // 1. Find listing
  const listing = await this.listingRepository.findById(listingId);

  if (!listing) {
    throw new Error("Listing not found");
  }

  // 2. Authorization
  const allowed = this.policyEngine.can(
    Action.DELETE,
    Resource.LISTING,
    {
      user: {
        id: actor.userId,
        role: actor.role,
      },
      resourceOwnerId: listing.ownerId,
    },
  );

  if (!allowed) {
    throw new Error(
      "Forbidden: user is not allowed to delete this listing"
    );
  }

  // 3. Delete
  await this.listingRepository.delete(listingId);

  // 4. Audit
  await this.auditLogger.writeAuditLog({
    action: "DELETE",
    resource: "LISTING",
    resourceId: listingId,
    resourceType: "LISTING",
    status: "SUCCESS",
    userId: actor.userId,
    ownerId: listing.ownerId,
  });
}
}