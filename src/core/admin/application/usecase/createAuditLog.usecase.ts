// src/core/admin/application/usecase/createAuditLog.usecase.ts

import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { AuditLog } from "../../domain/entities/auditLog";
import { IAuditLogRepository } from "../../domain/entities/IAuditLogRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

export interface CreateAuditLogInput {
  adminId: string;
  action: string;
  target: string;
  targetId?: string;
  details?: string;
  ip?: string;
}

@injectable()
export default class CreateAuditLogUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.auditLogRepository)
    private auditRepo: IAuditLogRepository
  ) {}

  async execute(input: CreateAuditLogInput): Promise<AuditLog> {
    const log = new AuditLog({
      id: uuidv4(),
      adminId: input.adminId,
      action: input.action,
      target: input.target,
      targetId: input.targetId,
      details: input.details,
      ip: input.ip,
      createdAt: new Date(),
    });

    return this.auditRepo.create(log);
  }
}
