// src/subgraphs/auth/adapters/audit.client.ts

import { inject, injectable } from "tsyringe";
import { AuditPort, AuditEvent, AuditQuery } from "../domain/auditPort";
import { TOKENS_AUDIT } from "@/subgraphs/audit/container/audit.tokens";
import AuditClient from "@/packages/audit-sdk/src/client/audit.client";


@injectable()
export class AuditAdapter implements AuditPort {
  constructor(
    @inject(TOKENS_AUDIT.auditClient)
    private client: AuditClient // 
  ) {}

  async record(event: AuditEvent): Promise<void> {
    await this.client.recordAudit({
      action: event.action,
      userId: event.userId,
      resourceId: event.resourceId || event.userId,
      
    });
  }

  async query(params: AuditQuery): Promise<AuditEvent[]> {
    const res = await this.client.queryAuditLogs({
      userId: params.userId,
      action: params.action,
    });

    //query, variables)//プロパティ 'request' は型 'AuditClient' に存在しません。

    return res.auditLogs.map((log: any) => ({
      userId: log.userId,
      action: log.action,
      metadata: JSON.parse(log.metadata || "{}"),
      timestamp: new Date(log.timestamp),
    }));
  }
}