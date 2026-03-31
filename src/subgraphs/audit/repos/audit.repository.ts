import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { AuditLogDocument } from '../models/audit.model';
import { TOKENS_AUDIT } from '../container/audit.tokens';


@injectable()
export class AuditRepository {
  constructor(
    @inject(TOKENS_AUDIT.models.audit) 
    private model: Model<AuditLogDocument>
  ) {}

  async findById(id: string): Promise<AuditLogDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByResourceId(resourceId: string): Promise<AuditLogDocument[]> {
    return this.model.find({ resourceId }).sort({ timestamp: -1 }).exec();
  }

  async create(data): Promise<AuditLogDocument> {
    return this.model.create(data);
  }
}