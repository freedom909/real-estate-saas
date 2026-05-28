// security/infrastructure/models/riskEvent.model.ts

import { RiskEventType } from "@/subgraphs/auth/infrastructure/models/riskEvent.model"

export interface RiskEventDocument {
  userId: string
  eventType: RiskEventType
  eventData?: Record<string, any>
  ip?: string
  userAgent?: string
  deviceId?: string
  createdAt: Date
  updatedAt?: Date
  severity: "LOW" | "MEDIUM" | "HIGH"
  score: number
}