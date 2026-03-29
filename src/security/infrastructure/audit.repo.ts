import { IAuditRepo } from "../types";

export class AuditRepo implements IAuditRepo {
  async save(event: any): Promise<void> {
    console.log("📦 Audit Log:", event);
  }
}