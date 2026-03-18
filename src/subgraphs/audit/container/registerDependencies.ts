import { container } from 'tsyringe';
import { AuditLogModel, AuditLogModelToken } from '../models/audit.model';
import { AuditRepository } from '../repos/audit.repository';
import { AuditService } from '../services/audit.service';

export function registerDependencies() {
  container.register(AuditLogModelToken, { useValue: AuditLogModel });
  container.register(AuditRepository, { useClass: AuditRepository });
  container.register(AuditService, { useClass: AuditService });
}