// src/subgraphs/auth/repos/credential.repo.ts

import { Document, Model } from 'mongoose';
import  Credential  from '../models/credential.model.js';

interface CredentialDocument extends Credential, Document {}

interface SessionOption {
  session?: any;
}

interface CreateCredentialParams {
  userId: string;
  provider: string;
  providerSub: string;
  email?: string;
  source?: string;
  providerAccountId?: string;
}

export default class CredentialRepo {
  private Credential: Model<CredentialDocument>;

  constructor({ CredentialModel }: { CredentialModel: Model<CredentialDocument> }) {
    if (!CredentialModel) {
      throw new Error(
        "CredentialRepo: CredentialModel is required"
      );
    }
    this.Credential = CredentialModel;
  }

  /**
   * Find local credential by email
   */
  async findPasswordByEmail(
    email: string,
    { session }: SessionOption = {}
  ): Promise<CredentialDocument | null> {
    return this.Credential.findOne({
      email,
      provider: "LOCAL",
    }).session(session || null);
  }

  async findOAuth(
    provider: string,
    providerSub: string,
    { session }: SessionOption = {}
  ): Promise<CredentialDocument | null> {
    return this.findByProviderSub({ provider, providerSub }, { session });
  }

  async createOAuthCredential(
    {
      userId,
      provider,
      providerUserId,
    }: {
      userId: string;
      provider: string;
      providerUserId: string;
    },
    { session }: SessionOption = {}
  ): Promise<CredentialDocument> {
    return this.create(
      {
        userId,
        provider,
        providerSub: providerUserId,
        source: "OAUTH_LOGIN",
      },
      { session }
    );
  }

  /**
   * Find by provider + sub
   */
  async findByProviderSub(
    { provider, providerSub }: { provider: string; providerSub: string },
    { session }: SessionOption = {}
  ): Promise<CredentialDocument | null> {
    return this.Credential.findOne({
      provider,
      providerSub,
    }).session(session || null);
  }

  /**
   * All credentials for user
   */
  async findByUserId(
    userId: string,
    { session }: SessionOption = {}
  ): Promise<CredentialDocument[]> {
    return this.Credential.find({
      userId,
    }).session(session || null);
  }

  /**
   * Create new credential
   * ⚠️ Relies on DB unique constraints
   */
  async create(
    {
      userId,
      provider,
      providerSub,
      email,
      source = "OAUTH_LOGIN",
    }: CreateCredentialParams,
    { session }: SessionOption = {}
  ): Promise<CredentialDocument> {
    const doc = new this.Credential({
      userId,
      provider,
      providerSub,
      email,
      source,
      lastLoginAt: new Date(),
    });

    return doc.save({ session });
  }

  /**
   * Delete credential by id
   */
  async deleteById(
    id: string,
    { session }: SessionOption = {}
  ): Promise<any> {
    return this.Credential.deleteOne(
      { _id: id },
      { session }
    );
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(
    id: string,
    { session }: SessionOption = {}
  ): Promise<any> {
    return this.Credential.updateOne(
      { _id: id },
      {
        $set: {
          lastLoginAt: new Date(),
        },
      },
      { session }
    );
  }

  /**
   * 🔀 Merge: move all credentials
   */
  async reassignUser(
    fromUserId: string,
    toUserId: string,
    { session }: SessionOption = {}
  ): Promise<any> {
    return this.Credential.updateMany(
      { userId: fromUserId },
      {
        $set: {
          userId: toUserId,
          source: "MERGE",
        },
      },
      { session }
    );
  }

  async findByProviderAccountId(
    provider: string,
    providerAccountId: string
  ) {
    return this.Credential.findOne({
      provider,
      providerAccountId,
    }).exec();
  }

}