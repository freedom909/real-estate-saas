// src/modules/audit/infrastructure/repositories/audit-log.repository.ts

import { inject, injectable } from "tsyringe";
import { AuditLogModel } from "../models/audit-log.model";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { IAuditLogRepository } from "@/modules/audit/domain/interface/audit-log.repository.interface";
import { AuditLog } from "@/modules/audit/domain/interface/auditLog";


@injectable()
export class AuditLogRepository implements IAuditLogRepository {

  constructor(
    @inject(TOKENS_AUDIT.models.auditLogModel)
    private readonly model: typeof AuditLogModel
  ) {}

  async create(data: Partial<AuditLog>): Promise<AuditLog> {
    const doc = await this.model.create(data);
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<AuditLog | null> {
    const doc = await this.model.findById(id).exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  async find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<AuditLog[]> {
    const {
      limit = 50,
      skip = 0,
      sort = { createdAt: -1 },
    } = options ?? {};

    const docs = await this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }

  async count(filter: any): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  private toDomain(doc: any): AuditLog {
    return {
      id: doc._id.toString(),
      userId: doc.userId?.toString(),
      tenantId: doc.tenantId,
      ownerId: doc.ownerId,
      action: doc.action,
      resourceId: doc.resourceId,
      resourceType: doc.resourceType,
      status: doc.status,
      requestId: doc.requestId,
      correlationId: doc.correlationId,
      meta: doc.meta,
      createdAt: doc.createdAt,
    };
  }
}
