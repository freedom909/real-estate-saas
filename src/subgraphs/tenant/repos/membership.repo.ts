// src/subgraphs/tenant/repos/membership.repo.ts

import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { MembershipDocument } from '../models/membership.model';


@injectable()
export class MembershipRepository {
    private model: Model<MembershipDocument>;
    constructor(

    model: Model<MembershipDocument>) {
    this.model = model;
    }
    async findByUserId(userId: string): Promise<MembershipDocument[]> {
    return this.model.find({ userId }).exec();
  } 
}







