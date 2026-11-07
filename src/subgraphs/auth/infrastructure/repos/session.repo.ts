// src/subgraphs/auth/repos/session.repo.ts
import { DefaultSchemaOptions, Document, Model, Types } from "mongoose";

import crypto from "crypto";
import { inject, injectable } from "tsyringe";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { Session } from "../../domain/valueObjects/session.vo";
import { SessionDocument } from "../models/session.model";

export interface CreateSessionInput {
  id: string
  userId: string
  deviceId?: string
  familyId: string
  refreshTokenId: string
  ipHash?: string
  userAgentHash?: string
  expiresAt?: Date
  activeTenantId?: string | null
  status?: "ACTIVE"
  revoked?: boolean
}

@injectable()
export default class SessionRepository {
  save(session: Document<unknown, {}, Document<unknown, {}, Session, {}, DefaultSchemaOptions> & Session & { _id: Types.ObjectId; } & { __v: number; }, {}, DefaultSchemaOptions> & Document<unknown, {}, Session, {}, DefaultSchemaOptions> & Session & { _id: Types.ObjectId; } & { __v: number; } & Required<{ _id: Types.ObjectId; }>) {
    throw new Error("Method not implemented.");
  }
  async updateActiveTenantForUser({
    userId,
    sessionId,
    tenantId,
  }: {
    userId: string;
    sessionId: string;
    tenantId: string;
  }): Promise<SessionDocument | null> {
    return this.model.findOneAndUpdate(
      {
        id: sessionId,
        userId,
        revoked: false,
        status: "ACTIVE",
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          activeTenantId: tenantId,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).exec();
  }
  constructor(
    @inject(TOKENS_AUTH.models.session)
    private model: Model<SessionDocument>
  ) { }

  async updateBySessionId(
    sessionId: string,
    data: Partial<Session>
  ) {
    return this.model.findOneAndUpdate(
      { id: sessionId },
      { $set: data },
      { new: true }
    );
  }

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

  async findActiveBySessionId(sessionId: string, userId: string) {
    return this.model.findOne({
      id: sessionId,
      userId,
      revoked: false,
      status: "ACTIVE",
      expiresAt: { $gt: new Date() },
    }).exec();
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

  async create(input: CreateSessionInput): Promise<SessionDocument> {
    const doc = await this.model.create(input)
    return doc;
  }

  async listByUser(userId: string): Promise<SessionDocument[]> {
    return this.model.find({
      userId,
      revoked: false,
    }).sort({ lastSeenAt: -1 });
  }

  async revoke(sessionId: string) {
    return this.model.updateOne(
      {
        _id: sessionId,
        revoked: false,
      },
      {
        $set: {
          revoked: true,
          revokedAt: new Date(),
          status: "REVOKED",
        },
      }
    );
  }

  async revokeAll(userId: string) {
    return this.model.updateMany(
      {
        userId,
        revoked: false,
      },
      {
        $set: {
          revoked: true,
          revokedAt: new Date(),
          status: "REVOKED",
        },
      }
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
      status: "ACTIVE",
      expiresAt: { $gt: new Date() },
    });
  }

  async revokeById(sessionId: string) {
    return this.model.updateOne(
      { id: sessionId, revoked: false, status: "ACTIVE" },
      {
        $set: {
          revoked: true,
          revokedAt: new Date(),
          status: "REVOKED",
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


  async findRecentSessions({ userId, since }: { userId: string; since: Date }) {
    return this.model.find({
      userId,
      lastSeenAt: { $gte: since },
    });
  }



  async findBySessionId(sessionId: string) {
    return this.model.findOne({ id: sessionId });
  }


  async rotateRefreshTokenIdForUser(input: {
    sessionId: string;
    userId: string;
    oldRefreshTokenId: string;
    newRefreshTokenId: string;
  }): Promise<boolean> {
    const result = await this.model.updateOne(
      {
        id: input.sessionId,
        userId: input.userId,
        refreshTokenId: input.oldRefreshTokenId,
        revoked: false,
        status: "ACTIVE",
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          refreshTokenId: input.newRefreshTokenId,
        },
      },
      {
        runValidators: true,
      }
    ).exec();

    return result.modifiedCount === 1;
  }
}
