import { inject, injectable } from "tsyringe";
import { AuditPort, AuditEvent, AuditQuery } from "../domain/auditPort";
import { TOKENS_AUDIT } from "@/subgraphs/audit/container/audit.tokens";

@injectable()
export class AuditAdapter implements AuditPort {
  constructor(
    @inject(TOKENS_AUDIT.auditClient)
    private client: any) {}

  async record(event: AuditEvent): Promise<void> {
    await this.client.mutate({
      mutation: `
        mutation RecordAudit($input: AuditInput!) {
          recordAudit(input: $input)
        }
      `,
      variables: {
        input: {
          userId: event.userId,
          action: event.action,
          metadata: event.metadata,
          timestamp: event.timestamp ?? new Date().toISOString(),
        },
      },
      context: {
        headers: {
          "x-service-token": process.env.INTERNAL_SERVICE_TOKEN,
        },
      },
    });
  }

  async query(params: AuditQuery): Promise<AuditEvent[]> {
    const res = await this.client.query({
      query: `
        query AuditLogs($filter: AuditFilter) {
          auditLogs(filter: $filter) {
            userId
            action
            metadata
            timestamp
          }
        }
      `,
      variables: {
        filter: params,
      },
      context: {
        headers: {
          "x-service-token": process.env.INTERNAL_SERVICE_TOKEN,
        },
      },
    });

    return res.data.auditLogs;
  }
}