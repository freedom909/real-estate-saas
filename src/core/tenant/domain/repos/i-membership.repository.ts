// src/core/tenant/domain/repos/i-membership.repository.ts

import { Membership } from "../entities/membership";

export interface IMembershipRepository {
  findByUserId(userId: string): Promise<Membership[]>;
  save(membership: Membership): Promise<Membership>;
  findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null>;

  findActiveByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null>;
}