// src/subgraphs/auth/repos/session.repo.ts
import { Model } from "mongoose";
import { Session, SessionDocument } from "../models/session.model";
import { inject, injectable } from "tsyringe";

export interface CreateSessionInput {
  userId: string
  deviceId?: string
  familyId: string
  refreshTokenId: string
  ipHash?: string
  userAgentHash?: string
  expiresAt?: Date
}

@injectable()
export default class SessionRepository {
  constructor(
    @inject("sessionModel")
    private sessionModel: Model<SessionDocument>
  ) { }

  async revokeSession(sessionId: any) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
  session.revoked = true;
  session.revokedAt = new Date();
  session.status = "REVOKED";

  return await session.save();
  }
  
async getOrCreateFamilyId(userId: string, deviceId: string): Promise<string> {
  const familyId = await this.sessionModel.findOneAndUpdate(
    { userId, deviceId })
    .select('familyId')
return familyId.familyId;
}

async create(input: CreateSessionInput): Promise<Session> {
  const doc = await this.sessionModel.create(input)

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
    return this.sessionModel.find({
      userId,
      revoked: false,
    }).sort({ lastSeenAt: -1 });
  }

  async revoke(sessionId: string) {
    return this.sessionModel.updateOne(
      { _id: sessionId },
      { $set: { revoked: true } }
    );
  }

  async revokeAll(userId: string) {
    return this.sessionModel.updateMany(
      { userId },
      { $set: { revoked: true } }
    );
  }

  async updateById(id: string, data: Partial<Session>) {
    return this.sessionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findById(id: string) {
    return this.sessionModel.findById(id);
  }

  async findActiveByUser(userId: string) {
  return this.sessionModel.find({
    userId,
    revoked: { $ne: true },
  });
}

async revokeById(sessionId: string) {
  return this.sessionModel.updateOne(
    { _id: sessionId },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    }
  );
}

async updateLastSeen(sessionId: string) {
  return this.sessionModel.updateOne(
    { _id: sessionId },
    {
      $set: {
        lastSeenAt: new Date(),
      },
    }
  );
}
  
async update(sessionId: string, data: Partial<Session>) {
  return this.sessionModel.findByIdAndUpdate(sessionId, data, { new: true });
}

async deleteMany(filter: Partial<Session>) {
  return this.sessionModel.deleteMany(filter);
}

async findBySessionId(sessionId: string) {
  return await this.sessionModel.findOne({ _id: sessionId });
}

  async findRecentSessions({ userId, since }: { userId: string; since: Date }) {
    return this.sessionModel.find({
      userId,
      lastSeenAt: { $gte: since },
    });
}
}
