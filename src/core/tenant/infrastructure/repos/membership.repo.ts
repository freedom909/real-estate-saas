// src/subgraphs/host/repos/membership.repo.ts

import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { MembershipDocument } from '../models/membership.model';
import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';



@injectable()
export class MembershipRepository {
    constructor(
      @inject(TOKENS_TENANT.models.membership) private model: Model<MembershipDocument>
    ) {}

    async findByUserId(userId: string): Promise<MembershipDocument[]> {
    return this.model.find({ userId }).exec();
  }

    async findByUserAndTenant(userId: string, tenantId: string): Promise<MembershipDocument | null> {
    // tenantId in membership is the ownerId (tenant owner's user ID)
    return this.model.findOne({ userId, ownerId: tenantId }).exec();
  }
}
