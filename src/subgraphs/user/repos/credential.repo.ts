// src/subgraphs/auth/repos/credential.repo.ts

import { Document, Model } from 'mongoose';
import CredentialModel from '../models/credential.model';

interface CredentialDocument extends Credential, Document {}

interface SessionOption {
  session?: any;
}

export interface Credential {
  id: string
  userId: string
  provider: string
  providerSub?: string
}

interface CreateCredentialParams {
  userId: string;
  provider: string;
  providerSub: string;
  email?: string;
  source?: string;
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
  async findByUserId(userId: string): Promise<Credential[]> {
    const docs=await this.Credential.find({
      userId,
    })
      return docs.map(d => ({
    id: d._id.toString(),
    userId: d.userId.toString(),
    provider: d.provider,
    providerSub: d.providerSub
  }))
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
}