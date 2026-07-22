// src/core/admin/infrastructure/persistence/auditLog.repository.ts

import { injectable, inject } from "tsyringe";
import { AuditLogMapper } from "../mappers/auditLog.mapper";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { IAuditLogRepository, AuditLogFilter } from "../../domain/entities/IAuditLogRepository";
import { AuditLog } from "../../domain/entities/auditLog";
import AuditLogModel from "../models/auditLog.model";
import { Op } from "sequelize";

@injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @inject(TOKENS_ADMIN.models.auditLogModel)
    private model: typeof AuditLogModel
  ) {}

  async create(log: AuditLog): Promise<AuditLog> {
    const persistence = AuditLogMapper.toPersistence(log);
    const created = await this.model.create(persistence);
    return AuditLogMapper.toDomain(created);
  }

  async findAll(limit: number = 50): Promise<AuditLog[]> {
    const records = await this.model.findAll({
      limit,
      order: [["createdAt", "DESC"]],
    });
    return records.map((r) => AuditLogMapper.toDomain(r));
  }

  private buildWhereClause(filter: AuditLogFilter): any {
    const where: any = {};

    if (filter.adminId) {
      where.adminId = filter.adminId;
    }

    if (filter.action) {
      where.action = { [Op.like]: `%${filter.action}%` };
    }

    if (filter.target) {
      where.target = { [Op.like]: `%${filter.target}%` };
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt[Op.gte] = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt[Op.lte] = new Date(filter.endDate);
      }
    }

    return where;
  }

  async findFiltered(limit: number, filter: AuditLogFilter): Promise<AuditLog[]> {
    const where = this.buildWhereClause(filter);
    const records = await this.model.findAll({
      where,
      limit,
      order: [["createdAt", "DESC"]],
    });
    return records.map((r) => AuditLogMapper.toDomain(r));
  }

  async countFiltered(filter: AuditLogFilter): Promise<number> {
    const where = this.buildWhereClause(filter);
    return this.model.count({ where });
  }

  async findByAdminId(adminId: string, limit: number = 50): Promise<AuditLog[]> {
    const records = await this.model.findAll({
      where: { adminId },
      limit,
      order: [["createdAt", "DESC"]],
    });
    return records.map((r) => AuditLogMapper.toDomain(r));
  }

  async findByTarget(target: string, limit: number = 50): Promise<AuditLog[]> {
    const records = await this.model.findAll({
      where: { target },
      limit,
      order: [["createdAt", "DESC"]],
    });
    return records.map((r) => AuditLogMapper.toDomain(r));
  }
}
