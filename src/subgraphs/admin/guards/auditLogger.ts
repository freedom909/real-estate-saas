// src/subgraphs/admin/guards/auditLogger.ts

import { container } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { IAuditLogRepository } from "@/core/admin/domain/entities/IAuditLogRepository";
import { AuditLog } from "@/core/admin/domain/entities/auditLog";

export interface AuditContext {
  action: string;
  target: string;
  targetId?: string;
  details?: string;
}

/**
 * Create an audit log entry for an admin action.
 * Called after a mutation succeeds.
 */
export async function logAuditAction(
  context: any,
  audit: AuditContext
): Promise<void> {
  try {
    const adminId = context?.admin?.id || context?.user?.userId || "unknown";
    const ip = context?.req?.ip || context?.req?.headers?.["x-forwarded-for"] || "unknown";

    const auditLog = new AuditLog({
      id: uuidv4(),
      adminId,
      action: audit.action,
      target: audit.target,
      targetId: audit.targetId,
      details: audit.details,
      ip: typeof ip === "string" ? ip : ip[0] || "unknown",
      createdAt: new Date(),
    });

    const repo = container.resolve<IAuditLogRepository>(
      TOKENS_ADMIN.repos.auditLogRepository
    );

    await repo.create(auditLog);
  } catch (err) {
    // Don't let audit logging failures break the main operation
    console.error("[AuditLog] Failed to create audit entry:", err);
  }
}

/**
 * Wrap a resolver with automatic audit logging.
 * The resolver must return an object that can be used to build the audit entry.
 */
export function withAuditLog(
  resolver: Function,
  auditBuilder: (result: any, args: any, context: any) => AuditContext
) {
  return async (parent: any, args: any, context: any, info: any) => {
    const result = await resolver(parent, args, context, info);

    // Only log successful operations
    if (result !== null && result !== undefined) {
      const auditContext = auditBuilder(result, args, context);
      await logAuditAction(context, auditContext);
    }

    return result;
  };
}
