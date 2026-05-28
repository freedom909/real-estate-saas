import { inject, injectable } from "tsyringe";
import { DecisionLogDocument, DecisionLogModel } from "../models/decision-log.model";
import { IDecisionLogRepository } from "../../../domain/repositories/interface/decision-log.repository.interface";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

@injectable()
export class DecisionLogRepository implements IDecisionLogRepository {
  constructor(
    @inject(TOKENS_AUDIT.models.decisionLog)
    private readonly model: typeof DecisionLogModel
  ) {}

  async find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<DecisionLogDocument[]> {
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

  async create(data: Partial<DecisionLogDocument>): Promise<DecisionLogDocument> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<DecisionLogDocument | null> {
    return await this.model.findById(id).exec();
  }
}