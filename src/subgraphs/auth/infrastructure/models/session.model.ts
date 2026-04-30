import { Schema, model, HydratedDocument } from "mongoose"
import { Session } from "../../domain/valueObjects/session.vo"

const sessionSchema = new Schema<Session>(
  {
     id: String,
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
    status: { type: String, default: "ACTIVE" }
  },
  { timestamps: true }
)

export type SessionDocument = HydratedDocument<Session>

export const SessionModel = model<Session>("Session", sessionSchema)

export default SessionModel
