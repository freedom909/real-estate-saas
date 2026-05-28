//
import { inject, injectable } from "tsyringe";
import { AuditLogDocument, AuditLogModel } from "../models/audit-log.model";

import { IAuditLogRepository } from "@/modules/audit/domain/repositories/interface/audit-log.repository.interface";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";



@injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @inject(TOKENS_AUDIT.models.auditLog)
    private readonly model: typeof AuditLogModel
  ) {}
 async find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<
    AuditLogDocument[]
  > {

    const {
      limit = 50,
      skip = 0,
      sort = {
        createdAt: -1,
      },
    } = options ?? {};

    return await this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(
    filter: any
  ): Promise<number> {

    return await this.model
      .countDocuments(filter)
      .exec();
  }

  async create(data: Partial<AuditLogDocument>): Promise<AuditLogDocument> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<AuditLogDocument | null> {
    return await this.model.findById(id).exec();
  }

}