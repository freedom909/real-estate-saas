import { inject, injectable } from "tsyringe";
import { SystemLogDocument, SystemLogModel } from "../models/system-log.model";
import { ISystemLogRepository } from "../../../domain/repositories/interface/system-log.repository.interface";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

@injectable()
export class SystemLogRepository implements ISystemLogRepository {
  constructor(
    @inject(TOKENS_AUDIT.models.systemLog)
    private readonly model: typeof SystemLogModel
  ) {}

  async find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<SystemLogDocument[]> {
    const {
      limit = 50,
      skip = 0,
      sort = {
        createdAt: -1,
      },
    } = options ?? {};

    return await this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: any): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  async create(data: Partial<SystemLogDocument>): Promise<SystemLogDocument> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<SystemLogDocument | null> {
    return await this.model.findById(id).exec();
  }
}