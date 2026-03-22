// src/subgraphs/auth/models/riskEvent.model.ts

import { Schema, model, Types, HydratedDocument } from "mongoose"

export type RiskEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "OAUTH_LOGIN"
  | "TOKEN_REFRESH"
  | "PASSWORD_RESET"
  | "TOKEN_REUSE"
  |  "NEW_DEVICE"
  | "IP_CHANGE"


// ===============================
// Domain interface
// ===============================

export interface RiskEventModel {

  userId: string

  eventType: RiskEventType

  eventData?: Record<string, any>

  ip?: string

  userAgent?: string

  deviceId?: string

  createdAt: Date

  updatedAt?: Date

  severity: "LOW" | "MEDIUM" | "HIGH"

 score:number
}


// ===============================
// Document type
// ===============================

export type RiskEventDocument = HydratedDocument<RiskEventModel>


// ===============================
// Schema
// ===============================

const riskEventSchema = new Schema<RiskEventModel>(
  {

    userId: {
      type: String,
      required: true,
      index: true
    },

    eventType: {
      type: String,
      required: true
    },

    eventData: {
      type: Object
    },

    ip: String,

    userAgent: String,

    deviceId: String

  },
  {
    timestamps: true
  }
)

// ===============================
// Model
// ===============================

const RiskEventModel = model<RiskEventModel>("RiskEvent", riskEventSchema)

export default RiskEventModel