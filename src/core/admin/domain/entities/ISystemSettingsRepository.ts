// src/core/admin/domain/entities/ISystemSettingsRepository.ts

import { SystemSettings } from "./systemSettings";

export interface ISystemSettingsRepository {
  findAll(): Promise<SystemSettings[]>;
  findByCategory(category: string): Promise<SystemSettings[]>;
  findByKey(key: string): Promise<SystemSettings | null>;
  upsert(key: string, value: string, category: string, description?: string, updatedBy?: string): Promise<SystemSettings>;
  delete(key: string): Promise<boolean>;
}
