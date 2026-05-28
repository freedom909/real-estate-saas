import { DecisionLogDocument } from "../../../infrastructure/database/models/decision-log.model";

export interface IDecisionLogRepository {
  find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<DecisionLogDocument[]>;
  count(filter: any): Promise<number>;
  create(data: Partial<DecisionLogDocument>): Promise<DecisionLogDocument>;
  findById(id: string): Promise<DecisionLogDocument | null>;
}