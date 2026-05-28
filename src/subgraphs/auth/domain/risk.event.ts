// 风险事件领域模型
import { createRedis } from "../../../infrastructure/redis/redis"
import { ObjectId } from "mongoose"
export default interface RiskEventEntity {

  id: string

  userId: string

  Type: string

  eventData?: any

  ip?: string

  userAgent?: string

  deviceId?: string

  createdAt: Date

  updatedAt?: Date

}
// 风险事件领域模型
export default class RiskEventEntity {

  id: string

  userId: string

  type:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "OAUTH_LOGIN"
    | "TOKEN_REFRESH"
    | "SUSPICIOUS_LOGIN"

  provider?: "google" | "github"

  ip?: string

  userAgent?: string

  deviceId?: string

  metadata?: Record<string, any>

  createdAt: Date

}
