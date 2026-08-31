//src/core/admin/application/usecase/auditAction.logger.ts

import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { AuditContext } from "@/subgraphs/admin/guards/auditLogger";
import { inject, injectable } from "tsyringe";
import { AdminAuditACL } from "../acl/admin.auditACL";

@injectable()
export class AuditActionLogger {
  constructor(
    @inject(TOKENS_ADMIN.acl.adminAuditACL)
    private readonly acl: AdminAuditACL
  ) {}

  async log(context: any, audit: AuditContext): Promise<void> {
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

      await this.acl.recordAdminAction({
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
        "[AuditActionLogger] Failed to create audit entry via AdminAuditACL:",
        err
      );
    }
  }
}
