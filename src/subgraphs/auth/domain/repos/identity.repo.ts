// domain/repos/identity.repo.ts

import { Identity } from "../entities/identity.entity";

export interface IIdentityRepo {
  findByProvider(provider: string, providerId: string): Promise<Identity | null>;
  findByUser(userId: string): Promise<Identity[]>;
  create(identity: Partial<Identity>): Promise<Identity>;
}