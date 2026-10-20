// src/core/tenant/domain/repos/i-membership.repository.ts

import { Membership } from "../entities/membership";


export interface IMembershipRepository {
  findById(id: string): Promise<Membership | null>;

  findByUserId(userId: string): Promise<Membership[]>;

  findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null>;

  findActiveByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null>;

  findByTenantId(
    tenantId: string,
    filter?: {
      userId?: string;
      role?: Membership["role"];
      status?: Membership["status"];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    items: Membership[];
    total: number;
  }>;
  create(membership: Membership): Promise<Membership>;
  save(membership: Membership): Promise<Membership>;
}
