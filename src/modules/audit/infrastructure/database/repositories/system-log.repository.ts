//src/modules/audit/infrastructure/database/repositories/system-log.repository.ts
import { inject, injectable } from "tsyringe";

import {
  SystemLogModel as MongooseSystemLogModel
} from "../models/system-log.model";
import { ISystemLogRepository } from "../../../domain/repositories/interface/system-log.repository.interface";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { SystemLog } from "@/modules/audit/domain/entities/systemLog.entity";


@injectable()
export class SystemLogRepository implements ISystemLogRepository {

  constructor(
    @inject(TOKENS_AUDIT.models.systemLogModel)
    private readonly model: typeof MongooseSystemLogModel
  ) {}

  async find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<SystemLog[]> {

    const {
      limit = 50,
      skip = 0,
      sort = {
        createdAt: -1,
      },
    } = options ?? {};

    const docs =
      await this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

    return docs.map(
      this.toDomain
    );
  }

  async count(
    filter: any
  ): Promise<number> {

    return await this.model
      .countDocuments(filter)
      .exec();
  }

  async create(
    data: Partial<SystemLog>
  ): Promise<SystemLog> {

    const doc =
      await this.model.create(data);

    return this.toDomain(doc);
  }

  async findById(
    id: string
  ): Promise<SystemLog | null> {

    const doc =
      await this.model
        .findById(id)
        .exec();

    if (!doc) {
      return null;
    }

    return this.toDomain(doc);
  }

  private toDomain(
    doc: any
  ): SystemLog {

    return {
      id:
        doc._id.toString(),

      level:
        doc.level,

      type:
        doc.type,

      service:
        doc.service,

      module:
        doc.module,

      action:
        doc.action,

      message:
        doc.message,

      correlationId:
        doc.correlationId,

      requestId:
        doc.requestId,

      meta:
        doc.meta,

      latencyMs:
        doc.latencyMs,

      stack:
        doc.stack,

      createdAt:
        doc.createdAt,
    };
  }
}