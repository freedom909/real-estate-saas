// src/modules/audit/infrastructure/repositories/auditLog.repository.ts

import { injectable, inject } from "tsyringe";

import {
  IAuditLogRepository,
  AuditLogFilter,
  AuditLogQueryOptions,
} from "../../domain/entities/IAuditLogRepository";

import { AuditLog } from "../../domain/entities/auditLog";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { AuditLogDocument, AuditLogModel } from "../../domain/value-objects/audit-log.model";
import { ResourceType } from "../../domain/value-objects/audit.types";
import { CreateAuditLogDTO } from "../../application/write/dto/create-audit-log.dto";

@injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @inject(TOKENS_AUDIT.models.auditLogModel)
    private readonly model: typeof AuditLogModel
  ) {}

  async create(dto: CreateAuditLogDTO): Promise<AuditLog> {
    const created = await this.model.create({
      userId: dto.userId,
      tenantId: dto.tenantId,
      ownerId: dto.ownerId,
      action: dto.action,
      resourceId: dto.resourceId,
      resourceType: dto.resourceType,
      status: dto.status,
      requestId: dto.requestId,
      correlationId: dto.correlationId,
      meta: dto.meta,
      
    });

    return this.toDomain(created);
  }

  async findAll(options?: AuditLogQueryOptions): Promise<AuditLog[]> {
    const records = await this.model
      .find({})
      .sort({ createdAt: -1 })
      .limit(options?.limit ?? 50)
      .skip(options?.skip ?? 0)
      .exec();

    return records.map((record) => this.toDomain(record));
  }

  async findFiltered(
    filter: AuditLogFilter,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]> {
    const query = this.buildFilter(filter);

    const records = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(options?.limit ?? 50)
      .skip(options?.skip ?? 0)
      .exec();

    return records.map((record) => this.toDomain(record));
  }

  async countFiltered(filter: AuditLogFilter): Promise<number> {
    const query = this.buildFilter(filter);

    return this.model.countDocuments(query).exec();
  }

  async findByUserId(
    userId: string,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]> {
    const records = await this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(options?.limit ?? 50)
      .exec();

    return records.map((record) => this.toDomain(record));
  }

  async findByResource(
    resourceType: ResourceType,
    resourceId: string,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]> {
    const records = await this.model
      .find({
        resourceType: resourceType as ResourceType,
        resourceId,
      })
      .sort({ createdAt: -1 })
      .limit(options?.limit ?? 50)
      .exec();

    return records.map((record) => this.toDomain(record));
  }

  private buildFilter(filter: AuditLogFilter): Record<string, any> {
    const query: Record<string, any> = {};

    if (filter.userId) {
      query.userId = filter.userId;
    }

    if (filter.tenantId) {
      query.tenantId = filter.tenantId;
    }

    if (filter.ownerId) {
      query.ownerId = filter.ownerId;
    }

    if (filter.action) {
      query.action = {
        $regex: filter.action,
        $options: "i",
      };
    }

    if (filter.resourceType) {
      query.resourceType = filter.resourceType;
    }

    if (filter.resourceId) {
      query.resourceId = filter.resourceId;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.requestId) {
      query.requestId = filter.requestId;
    }

    if (filter.correlationId) {
      query.correlationId = filter.correlationId;
    }

    if (filter.startDate || filter.endDate) {
      query.createdAt = {};

      if (filter.startDate) {
        query.createdAt.$gte = new Date(filter.startDate);
      }

      if (filter.endDate) {
        query.createdAt.$lte = new Date(filter.endDate);
      }
    }

    return query;
  }

  private toDomain(record: AuditLogDocument): AuditLog {
   
    return {
      id: record._id.toString(),
      userId: record.userId?.toString(),
      tenantId: record.tenantId,
      ownerId: record.ownerId, 
      action: record.action,
      resourceId: record.resourceId,
      resourceType: record.resourceType,
      status: record.status,
      requestId: record.requestId,
      correlationId: record.correlationId,
      
      createdAt: record.createdAt,
    };
  }
}