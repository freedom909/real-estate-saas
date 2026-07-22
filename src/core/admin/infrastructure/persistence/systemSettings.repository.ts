// src/core/admin/infrastructure/persistence/systemSettings.repository.ts

import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { SystemSettingsMapper } from "../mappers/systemSettings.mapper";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { ISystemSettingsRepository } from "../../domain/entities/ISystemSettingsRepository";
import { SystemSettings } from "../../domain/entities/systemSettings";
import SystemSettingsModel from "../models/systemSettings.model";

@injectable()
export class SystemSettingsRepository implements ISystemSettingsRepository {
  constructor(
    @inject(TOKENS_ADMIN.models.systemSettingsModel)
    private model: typeof SystemSettingsModel
  ) {}

  async findAll(): Promise<SystemSettings[]> {
    const records = await this.model.findAll({ order: [["category", "ASC"], ["key", "ASC"]] });
    return records.map((r) => SystemSettingsMapper.toDomain(r));
  }

  async findByCategory(category: string): Promise<SystemSettings[]> {
    const records = await this.model.findAll({
      where: { category },
      order: [["key", "ASC"]],
    });
    return records.map((r) => SystemSettingsMapper.toDomain(r));
  }

  async findByKey(key: string): Promise<SystemSettings | null> {
    const record = await this.model.findOne({ where: { key } });
    return record ? SystemSettingsMapper.toDomain(record) : null;
  }

  async upsert(key: string, value: string, category: string, description?: string, updatedBy?: string): Promise<SystemSettings> {
    const existing = await this.model.findOne({ where: { key } });

    if (existing) {
      await this.model.update(
        { value, description, updatedBy, updatedAt: new Date() },
        { where: { key } }
      );
      const updated = await this.model.findOne({ where: { key } });
      return SystemSettingsMapper.toDomain(updated!);
    }

    const created = await this.model.create({
      id: uuidv4(),
      key,
      value,
      category,
      description,
      updatedBy,
    });
    return SystemSettingsMapper.toDomain(created);
  }

  async delete(key: string): Promise<boolean> {
    const deletedCount = await this.model.destroy({ where: { key } });
    return deletedCount > 0;
  }
}
