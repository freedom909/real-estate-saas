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
  status?: "ACTIVE" | "REVOKED"
}