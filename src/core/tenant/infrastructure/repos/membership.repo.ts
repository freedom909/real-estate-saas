// src/core/tenant/infrastructure/repos/membership.repo.ts

import { injectable, inject } from "tsyringe";
import { Model } from "mongoose";

import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { Membership } from "../../domain/entities/membership";

import { MembershipDocument } from "../models/membership.model";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { getMongoSession } from "@/core/shared/infrastructure/transaction/mongo-session-context";

@injectable()
export class MembershipRepository implements IMembershipRepository {
  constructor(
    @inject(TOKENS_TENANT.models.membership)
    private readonly model: Model<MembershipDocument>
  ) {}

async findById(id: string): Promise<Membership | null> {
  const document = await this.model.findById(id).exec();

  return document ? this.toDomain(document) : null;
}

async findByTenantId(
  tenantId: string,
  filter: {
    userId?: string;
    role?: Membership["role"];
    status?: Membership["status"];
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ items: Membership[]; total: number }> {
  const query: Record<string, unknown> = { tenantId };

  if (filter.userId) query.userId = filter.userId;
  if (filter.role) query.role = filter.role;
  if (filter.status) query.status = filter.status;

  const limit = Math.min(Math.max(filter.limit ?? 20, 1), 100);
  const offset = Math.max(filter.offset ?? 0, 0);

  const [documents, total] = await Promise.all([
    this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec(),
    this.model.countDocuments(query).exec(),
  ]);

  return {
    items: documents.map((document) => this.toDomain(document)),
    total,
  };
}

async create(membership: Membership): Promise<Membership> {
  const session = getMongoSession();
const documents = await this.model.create(
    [
      {
        userId: membership.userId,
        tenantId: membership.tenantId,
        role: membership.role,
        status: membership.status,
      },
    ],
    session ? { session } : {},
  );
  return this.toDomain(documents[0]);
}

  
async save(membership: Membership): Promise<Membership> {
  if (!membership.id) {
    throw new Error("Cannot update a membership without an ID");
  }

  const session = getMongoSession();

  const document = await this.model
    .findOneAndUpdate(
      { _id: membership.id },
      {
        $set: {
          role: membership.role,
          status: membership.status,
        },
      },
      {
        new: true,
        upsert: false,
        ...(session ? { session } : {}),
      },
    )
    .exec();

  if (!document) {
    throw new Error("Membership not found");
  }

  return this.toDomain(document);
}


  async findByUserId(userId: string): Promise<Membership[]> {
    const documents = await this.model
      .find({ userId })
      .exec();

    return documents.map((document) =>
      this.toDomain(document)
    );
  }

  async findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null> {
    const document = await this.model
      .findOne({ userId, tenantId })
      .exec();

    return document
      ? this.toDomain(document)
      : null;
  }

  async findActiveByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null> {
    const document = await this.model
      .findOne({
        userId,
        tenantId,
        status: "ACTIVE",
      })
      .exec();

    return document
      ? this.toDomain(document)
      : null;
  }

  private toDomain(document: MembershipDocument): Membership {
    return new Membership(
      document._id.toString(),
      document.userId.toString(),
      document.tenantId.toString(),
      document.role,
      document.status
    );
  }
}