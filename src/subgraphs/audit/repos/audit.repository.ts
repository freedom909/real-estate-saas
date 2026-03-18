import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { AuditLogDocument, AuditLogModelToken } from '../models/audit.model';

@injectable()
export class AuditRepository {
  constructor(
    @inject(AuditLogModelToken) private model: Model<AuditLogDocument>
  ) {}

  async findById(id: string): Promise<AuditLogDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByResourceId(resourceId: string): Promise<AuditLogDocument[]> {
    return this.model.find({ resourceId }).sort({ timestamp: -1 }).exec();
  }

  async create(data: { action: string; userId: string; resourceId: string }): Promise<AuditLogDocument> {
    return this.model.create(data);
  }
}