//security/domain/events/riskEvent.ts

import { RiskEventType } from "@/subgraphs/auth/infrastructure/models/riskEvent.model"

export class RiskEvent {
  constructor(
    public readonly userId: string,
    public readonly type: RiskEventType,
    public readonly context: {
      ip?: string
      userAgent?: string
      deviceId?: string
    },
    public readonly severity: "LOW" | "MEDIUM" | "HIGH",
    public readonly score: number,
    public readonly createdAt: Date
  ) {}
}