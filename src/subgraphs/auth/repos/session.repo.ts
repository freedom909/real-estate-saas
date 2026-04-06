// src/subgraphs/auth/repos/session.repo.ts
import { Model } from "mongoose";
import SessionModel, { Session, SessionDocument } from "../models/session.model";
import { inject, injectable } from "tsyringe";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";

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
  @inject(TOKENS_AUTH.models.session)
  private model: typeof SessionModel
  ) { }

  async revokeSession(sessionId: any) {
    const session = await this.model.findById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
  session.revoked = true;
  session.revokedAt = new Date();
  session.status = "REVOKED";

  return await session.save();
  }
  
async getOrCreateFamilyId(userId: string, deviceId: string): Promise<string> {
  const session = await this.model.findOneAndUpdate(
    { userId, deviceId },
    {
      $setOnInsert: {
        familyId: crypto.randomUUID(),
        userId,
        deviceId,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  return session.familyId;
}

async create(input: CreateSessionInput): Promise<Session> {
  const doc = await this.model.create(input)

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
    return this.model.find({
      userId,
      revoked: false,
    }).sort({ lastSeenAt: -1 });
  }

  async revoke(sessionId: string) {
    return this.model.updateOne(
      { _id: sessionId },
      { $set: { revoked: true } }
    );
  }

  async revokeAll(userId: string) {
    return this.model.updateMany(
      { userId },
      { $set: { revoked: true } }
    );
  }

  async updateById(id: string, data: Partial<Session>) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async findById(id: string) {
    return this.model.findById(id);
  }

  async findActiveByUser(userId: string) {
  return this.model.find({
    userId,
    revoked: { $ne: true },
  });
}

async revokeById(sessionId: string) {
  return this.model.updateOne(
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
  return this.model.updateOne(
    { _id: sessionId },
    {
      $set: {
        lastSeenAt: new Date(),
      },
    }
  );
}
  
async update(sessionId: string, data: Partial<Session>) {
  return this.model.findByIdAndUpdate(sessionId, data, { new: true });
}

async deleteMany(filter: Partial<Session>) {
  return this.model.deleteMany(filter);
}

async findBySessionId(sessionId: string) {
  return await this.model.findOne({ _id: sessionId });
}

  async findRecentSessions({ userId, since }: { userId: string; since: Date }) {
    return this.model.find({
      userId,
      lastSeenAt: { $gte: since },
    });
}
}
