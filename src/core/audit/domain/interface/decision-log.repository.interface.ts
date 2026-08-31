//src/modules/audit/domain/repositories/interface/decision-log.repository.interface.ts

import { DecisionLog } from "../entities/decisionLog";


export interface IDecisionLogRepository {
  find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<DecisionLog[]>;
  count(filter: any): Promise<number>;
  create(data: Partial<DecisionLog>): Promise<DecisionLog>;
  findById(id: string): Promise<DecisionLog | null>;
}
