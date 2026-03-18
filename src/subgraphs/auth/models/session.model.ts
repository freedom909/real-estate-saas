import { Schema, model, HydratedDocument } from "mongoose"

export interface Session {
  id: string
  userId: string
  familyId: string
  deviceId: string
  userAgentHash: string
  ipHash: string
  refreshTokenId: string
  revoked?: boolean
  revokedAt?: Date
  lastSeenAt?: Date
  expiresAt?: Date
}

const sessionSchema = new Schema<Session>(
  { id: String,
    userId: String,
    familyId: String,
    deviceId: String,
    userAgentHash: String,
    ipHash: String,
    refreshTokenId: String,
    revoked: { type: Boolean, default: false },
    revokedAt: Date,
    lastSeenAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
)

export type SessionDocument = HydratedDocument<Session>

export const SessionModel = model<Session>("Session", sessionSchema)

export default SessionModel
