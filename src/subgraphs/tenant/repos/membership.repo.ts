// src/subgraphs/host/repos/membership.repo.ts

import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { MembershipDocument } from '../models/membership.model';
import { TOKENS_Host } from '@/modules/tokens/host.tokens';


@injectable()
export class MembershipRepository {
    constructor(
      @inject(TOKENS_Host.models.membership) private model: Model<MembershipDocument>
    ) {}

    async findByUserId(userId: string): Promise<MembershipDocument[]> {
    return this.model.find({ userId }).exec();
  } 
}
