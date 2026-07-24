import { injectable, inject } from 'tsyringe';
import { AuditRepository } from '../repos/audit.repository';
import { AuditLogDocument } from '../models/audit.model';
import { AuditLogEvent } from '@/modules/audit/domain/event/audit-log.event';


@injectable()
export class AuditService {
  constructor(
    @inject(AuditRepository) private repo: AuditRepository
  ) {}

  async getAuditLog(id: string): Promise<AuditLogDocument | null> {
    return this.repo.findById(id);
  }

  async getLogsByResource(resourceId: string): Promise<AuditLogDocument[]> {
    return this.repo.findByResourceId(resourceId);
  }

  async createLog(action: string, userId: string, resourceId?: string, metadata?: string): Promise<AuditLogDocument> {
    return this.repo.create({ action, userId, resourceId, metadata });
  }
  async record(event: AuditLogEvent) {
  return this.repo.create({
    ...event,
    timestamp: new Date()
  });
}
}