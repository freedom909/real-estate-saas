// src/subgraphs/admin/guards/auditLogger.ts

import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { container } from "tsyringe";
import { AdminAuditACL } from "@/core/admin/application/acl/admin.auditACL";

export interface AuditContext {
  action: string;
  target: string;
  targetId?: string;
  details?: string;
}

/**
 * Create an audit log entry for an admin action.
 * Called after a mutation succeeds.
 * Delegates 100% to AdminAuditACL (anticorruption layer against the Audit module).
 */
export async function logAuditAction(
  context: any,
  audit: AuditContext
): Promise<void> {
  try {
    const adminId =
      context?.admin?.id ||
      context?.user?.userId ||
      "unknown";

    const ipRaw =
      context?.req?.ip ||
      context?.req?.headers?.["x-forwarded-for"] ||
      "unknown";

    const ip = typeof ipRaw === "string" ? ipRaw : ipRaw?.[0] || "unknown";
    const userAgent = context?.req?.headers?.["user-agent"];

    const acl = container.resolve<AdminAuditACL>(TOKENS_ADMIN.acl.adminAuditACL);
    await acl.recordAdminAction({
      adminId,
      action: audit.action,
      target: audit.target,
      targetId: audit.targetId,
      details: audit.details,
      ip,
      userAgent,
    });
  } catch (err) {
    console.error(
      "[AuditLog] Failed to create audit entry via AdminAuditACL:",
      err
    );
  }
}

/**
 * Wrap a resolver with automatic audit logging (via ACL → Audit module).
 */
export function withAuditLog(
  resolver: Function,
  auditBuilder: (result: any, args: any, context: any) => AuditContext
) {
  return async (parent: any, args: any, context: any, info: any) => {
    const result = await resolver(parent, args, context, info);

    if (result !== null && result !== undefined) {
      const auditContext = auditBuilder(result, args, context);
      await logAuditAction(context, auditContext);
    }

    return result;
  };
}
