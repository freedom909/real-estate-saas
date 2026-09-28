// src/core/tenant/infrastructure/repos/membership.repo.ts

import { injectable, inject } from "tsyringe";
import { Model } from "mongoose";

import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { Membership } from "../../domain/entities/membership";

import { MembershipDocument } from "../models/membership.model";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";

@injectable()
export class MembershipRepository implements IMembershipRepository {
  constructor(
    @inject(TOKENS_TENANT.models.membership)
    private readonly model: Model<MembershipDocument>
  ) {}

  async save(membership: Membership): Promise<Membership> {
    const document = await this.model
      .findOneAndUpdate(
        {
          userId: membership.userId,
          tenantId: membership.tenantId,
        },
        {
          $set: {
            role: membership.role,
            status: membership.status,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      )
      .exec();

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

  private toDomain(
    document: MembershipDocument
  ): Membership {
    return new Membership(
      document._id.toString(),
      document.userId.toString(),
      document.tenantId.toString(),
      document.role,
      document.status
    );
  }
}