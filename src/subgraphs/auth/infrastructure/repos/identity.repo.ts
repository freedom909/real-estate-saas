// infrastructure/repos/identity.repo.ts

import { IIdentityRepo } from "../../domain/repos/identity.repo";
import { Identity } from "../../domain/entities/identity.entity";
import { IdentityModel } from "../models/identity.model";

export class IdentityRepository implements IIdentityRepo {

  async findByProvider(provider: string, providerId: string) {
    const doc = await IdentityModel
      .findOne({ provider, providerId })
      .lean();

    if (!doc) return null;

    return new Identity(
      doc._id.toString(),
      doc.userId,
      doc.provider,
      doc.providerId,
      doc.email
    );
  }

  async findByUser(userId: string) {
    const docs = await IdentityModel.find({ userId }).lean();

    return docs.map(
      d =>
        new Identity(
          d._id.toString(),
          d.userId,
          d.provider,
          d.providerId,
          d.email
        )
    );
  }

  async create(data: Partial<Identity>) {
    const doc = await IdentityModel.create(data);

    return new Identity(
      doc._id.toString(),
      doc.userId,
      doc.provider,
      doc.providerId,
      doc.email
    );
  }
}