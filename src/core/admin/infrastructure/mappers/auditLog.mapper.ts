// src/core/admin/infrastructure/mappers/auditLog.mapper.ts

import { AuditLog } from "../../domain/entities/auditLog";

export class AuditLogMapper {
  static toDomain(raw: any): AuditLog {
    return new AuditLog({
      id: raw.id,
      adminId: raw.adminId,
      action: raw.action,
      target: raw.target,
      targetId: raw.targetId,
      details: raw.details,
      ip: raw.ip,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(log: AuditLog) {
    return {
      id: log.id,
      adminId: log.adminId,
      action: log.action,
      target: log.target,
      targetId: log.targetId,
      details: log.details,
      ip: log.ip,
      createdAt: log.createdAt,
    };
  }
}
