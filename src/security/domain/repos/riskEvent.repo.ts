// security/domain/repos/riskEvent.repo.ts

import { RiskEvent } from "../security/domain/events/riskEvent";

export interface IRiskEventRepo {
  save(event: RiskEvent): Promise<void>
}