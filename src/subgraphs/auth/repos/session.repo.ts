// src/subgraphs/auth/repos/session.repo.ts
import { Model } from "mongoose";
import { Session, SessionDocument } from "../models/session.model";

export interface CreateSessionInput {
  userId: string
  deviceId: string
  familyId: string
  refreshTokenId: string
  ipHash: string
  userAgentHash?: string
  expiresAt?: Date
}

export default class SessionRepository {
  private SessionModel: Model<Session>;

  constructor({ SessionModel }: { SessionModel: Model<Session> }) {
    this.SessionModel = SessionModel;
  }

async create(input: CreateSessionInput): Promise<Session> {
  const doc = await this.SessionModel.create(input)

  return {
    id: doc._id.toString(),
    userId: doc.userId,
    familyId: doc.familyId,
    deviceId: doc.deviceId,
    userAgentHash: doc.userAgentHash,
    ipHash: doc.ipHash,
    refreshTokenId: doc.refreshTokenId,
    revoked: doc.revoked,
    revokedAt: doc.revokedAt,
    lastSeenAt: doc.lastSeenAt,
    expiresAt: doc.expiresAt,
  }
}

  async listByUser(userId: string): Promise<SessionDocument[]> {
    return this.SessionModel.find({
      userId,
      revoked: false,
    }).sort({ lastSeenAt: -1 });
  }

  async revoke(sessionId: string) {
    return this.SessionModel.updateOne(
      { _id: sessionId },
      { $set: { revoked: true } }
    );
  }

  async revokeAll(userId: string) {
    return this.SessionModel.updateMany(
      { userId },
      { $set: { revoked: true } }
    );
  }

  async updateById(id: string, data: Partial<Session>) {
    return this.SessionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findById(id: string) {
    return this.SessionModel.findById(id);
  }

  async findActiveByUser(userId: string) {
  return this.SessionModel.find({
    userId,
    revoked: { $ne: true },
  });
}

async revokeById(sessionId: string) {
  return this.SessionModel.updateOne(
    { _id: sessionId },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    }
  );
}
}
